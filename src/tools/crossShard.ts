import { ScreepsApi } from "@/api/ScreepsApi";
import { createConnection, MoreThan } from "typeorm";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as PromisePool from "@supercharge/promise-pool";

import * as fs from "fs";
import { RoomObjectEntity } from "@/entity/RoomObject";
import { RoomEntity } from "@/entity/Room";

const connection = createConnection({
  type: "postgres",
  host: process.env.PG_HOST,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  port: parseInt(process.env.PG_PORT!),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [RoomEntity, RoomObjectEntity],
  synchronize: true,
  logging: false
});
let totMid = 0;
let ret: { path: string[]; distance: number; totalRooms: number } = {
  path: [],
  distance: 0,
  totalRooms: 0
};
let mid: Record<string, string> = {}; // 表示上一个节点，用来记录路径
/**
 * 跨 Shard 工具类
 */
export class CrossShard {
  public api = new ScreepsApi("https://screeps.com");

  /**
   * 获取房间内的 RoomObject
   * @param roomName 房间名
   * @param shard Shard 名
   * @return Promise<void>
   */
  public async getRoomObjectInRoom(roomName: string, shard: string): Promise<void> {
    const roomObjectRepository = (await connection).getRepository(RoomObjectEntity);
    const roomObjects = (await this.api.gameRoomObjects(roomName, shard)).objects.filter(
      ({ type }) =>
        type === "portal" ||
        type === "controller" ||
        type === "source" ||
        type === "mineral" ||
        type === "constructedWall" ||
        type === "rampart" ||
        type === "storage" ||
        type === "terminal" ||
        type === "tower" ||
        type === "factory"
    );

    if (roomObjects.length > 0) {
      for (const roomObject of roomObjects) {
        try {
          const { room, x, y, type, _id } = roomObject;
          Object.keys(roomObject).forEach(key =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ["room", "x", "y", "type", "_id"].includes(key) ? delete roomObject[key] : ""
          );

          await roomObjectRepository.save({
            id: _id,
            shard,
            room,
            x,
            y,
            type,
            other: roomObject,
            _id: shard + room + _id
          });
        } catch (err) {
          console.log(err);
        }
      }
    }
    console.info(`${shard}\t${roomName}\t${roomObjects.length}`);
  }

  /**
   * 获取房间地形
   * @param roomName 房间名
   * @param shard Shard 名
   * @return Promise<void>
   */
  public async getRoomTerrain(roomName: string, shard: string): Promise<string> {
    const roomTerrainResult = await this.api.gameRoomTerrain(roomName, shard);
    return roomTerrainResult.terrain[0].terrain;
  }

  public distance: Record<string, Record<string, number>> = {};
  public portals: Record<string, Record<string, Portal[]>> = {};

  /**
   * 遍历 shard
   * @param roomName 房间名
   * @param shard Shard 名
   * @return Promise<void>
   */
  public async getRoom(roomName: string, shard: string): Promise<void> {
    this.api.setToken(Date.now().toString());
    const roomObjectRepository = (await connection).getRepository(RoomObjectEntity);
    const roomRepository = (await connection).getRepository(RoomEntity);
    const terrain = await this.getRoomTerrain(roomName, shard);

    const roomsObject = await roomObjectRepository.find({ room: roomName, shard });

    if (roomsObject.length > 0) {
      await roomObjectRepository.delete({ room: roomName, shard });
    }

    await this.getRoomObjectInRoom(roomName, shard);

    try {
      await roomRepository.save({
        room: roomName,
        shard,
        terrain,
        updateTime: Date.now(),
        _id: shard + roomName
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * 获取所有 RoomObject
   * @return Promise<void>
   */
  public async getAllRoomObject(): Promise<void> {
    // eslint-disable-next-line import/namespace
    await PromisePool.for(["shard0", "shard1", "shard2", "shard3"])
      .withConcurrency(2)
      .process(async shard => await this.traversalShard(shard));
  }

  /**
   * CrossShard 寻路
   * @return Promise<void>
   */
  public async solve(): Promise<void> {
    const roomObjectRepository = (await connection).getRepository(RoomObjectEntity);
    const portals = await roomObjectRepository.find({ where: { type: "portal" } });

    try {
      fs.writeFileSync("portals.json", JSON.stringify(portals));
      console.log("JSON data is saved.");
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * 遍历 shard
   * @param shard Shard 名
   * @return Promise<void>
   */
  public async traversalShard(shard: string): Promise<void> {
    const roomRepository = (await connection).getRepository(RoomEntity);
    const worldSize = await this.api.gameWorldSize(shard);
    const roomNames: string[] = [];
    for (const longitudeTag of ["W", "E"]) {
      for (const latitudeTag of ["N", "S"]) {
        for (let longitude = 0; longitude < worldSize.width / 2; longitude++) {
          for (let latitude = 0; latitude < worldSize.height / 2; latitude++) {
            const roomName = `${longitudeTag}${longitude}${latitudeTag}${latitude}`;
            roomNames.push(roomName);
          }
        }
      }
    }
    let skipRoomNames: string[] = [];
    // eslint-disable-next-line new-cap
    await roomRepository
      .find({
        shard,
        // eslint-disable-next-line new-cap
        updateTime: MoreThan(Date.now() - 7 * 24 * 60 * 60 * 1000)
      })
      .then(res => {
        skipRoomNames = res.map(room => room.room);
      });

    const difference = roomNames
      .concat(skipRoomNames)
      .filter(v => !roomNames.includes(v) || !skipRoomNames.includes(v));
    // eslint-disable-next-line import/namespace
    await PromisePool.for(difference)
      .withConcurrency(100)
      .process(roomName => this.getRoom(roomName, shard));
  }

  /**
   * 添加座标对象
   * @param posObject 座标对象
   * @return Promise<void>
   */
  public addRoomPosObject(posObject: Portal): void {
    const { shard, room } = posObject;
    if (!this.portals[shard]) this.portals[shard] = {};
    if (!this.portals[shard][room]) this.portals[shard][room] = [];
    this.portals[shard][room].push(posObject);
  }

  /**
   * 构建 Portals
   * @param shard shard 名
   * @return Promise<void>
   */
  public async buildPortals(shard: string): Promise<void> {
    if (!this.portals[shard]) this.portals[shard] = {};
    const roomObjectRepository = (await connection).getRepository(RoomObjectEntity);
    (await roomObjectRepository.find({ where: { type: "portal", shard } })).forEach(portal => {
      const { id, shard, room, x, y } = portal;
      const other = portal.other as {
        disabled?: boolean;
        destination: { shard?: string; room: string; x?: number; y?: number };
      };
      this.addRoomPosObject({
        id,
        shard,
        room,
        x,
        y,
        disabled: other.disabled === true,
        destination: other.destination
      });
    });

    // 每个房间的shard内虫洞只保留边界处的洞,并且过滤掉中心房的虫洞
    for (const roomName in this.portals[shard]) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.portals[shard].hasOwnProperty(roomName)) {
        const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        const x = parseInt(<string>parsed?.[1]);
        const y = parseInt(<string>parsed?.[2]);
        if (x % 10 === 5 && y % 10 === 5) {
          delete this.portals[shard][roomName];
          continue; // 过滤掉中心房的虫洞
        }

        let isNS: boolean;
        let isCross = false;
        if (x % 10 == 0 && y % 10 == 0) {
          // 如果不是十字路口，判断他的虫洞属于南北走向的还是东西走向的
          isCross = true;
          /*
          let rx = roomNameToNum(roomName).x,ry = roomNameToNum(roomName).y;
          if( portals[numToRoomName({x:rx+1,y:ry})] || portals[numToRoomName({x:rx+1,y:ry})] ){
              is_NS = false;
          }else{
              is_NS = true;
          }*/
        } else if (x % 10 == 0) {
          // 如果是南北走向的
          isNS = true;
        } else if (y % 10 == 0) {
          // 如果是东西走向的
          isNS = false;
        }

        if (this.portals[shard][roomName].length > 20) {
          const tmp: Portal[] = [];
          this.portals[shard][roomName].forEach(portal => {
            if (portal.destination?.shard) {
              tmp.push(portal);
            } else {
              if (!isCross) {
                if (isNS) {
                  // 如果是南北走向的
                  if (portal.y <= 2 || portal.y >= 47) {
                    tmp.push(portal);
                  }
                } else {
                  // 如果是东西走向的
                  if (portal.x <= 2 || portal.x >= 47) {
                    tmp.push(portal);
                  }
                }
              }
            }
          });
          this.portals[shard][roomName] = tmp;
        }
      }
    }
  }

  /**
   * 计算跨 Shard Portal 距离
   * @param shardName1 Shard 名
   * @param shardName2 Shard 名
   * @return void
   */
  public clacCrossShardPortalDistance(shardName1: string, shardName2: string): void {
    for (const roomName in this.portals[shardName1]) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.portals[shardName1].hasOwnProperty(roomName)) {
        const portals = this.portals[shardName1][roomName];
        for (const portal of portals) {
          if (portal.destination?.shard != shardName2) continue;
          // 获取目标虫洞
          if (portal.destination && portal.destination.room && !this.portals[shardName2][portal.destination.room])
            continue; // 目标房不可用
          const desPortal = this.portals[shardName2][portal.destination.room as string].find(
            p => p.destination?.shard == shardName1 && p.destination.room == portal.room
          );
          if (!desPortal) continue; // 对应房间没有回来的虫洞

          const name1 = `${shardName1}_${portal.room}_${portal.x}_${portal.y}`;
          const name2 = `${shardName2}_${desPortal.room}_${desPortal.x}_${desPortal.y}`;
          if (!this.distance[name1]) this.distance[name1] = {};
          if (!this.distance[name2]) this.distance[name2] = {};
          this.distance[name1][name2] = 0;
          this.distance[name2][name1] = 0;
        }
      }
    }
  }

  /**
   * 计算同 Shard Portal 距离
   * @param shard Shard 名
   * @return Promise<void>
   */
  public clacInnerShardPortalDistance(shard: string): void {
    for (const roomName in this.portals[shard]) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.portals[shard].hasOwnProperty(roomName)) {
        const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        const x = this.roomNameToNum(roomName).x;
        const y = this.roomNameToNum(roomName).y;
        if (parseInt(<string>parsed?.[1]) % 10 == 0 && parseInt(<string>parsed?.[2]) % 10 == 0) {
          for (const startPortal of this.portals[shard][roomName]) {
            const startPortalName =
              shard + "_" + roomName + "_" + startPortal.x.toString() + "_" + startPortal.y.toString();

            const range = 10;
            for (let dx = -range; dx <= range; dx++) {
              for (let dy = -range; dy <= range; dy++) {
                const nx = x + dx;
                const ny = y + dy;
                if (Math.abs(dx) + Math.abs(dy) > range) continue;
                const nextRoomName = this.numToRoomName({ x: nx, y: ny });
                if (!this.isCenter(nx, ny) && this.portals[shard][nextRoomName]) {
                  // 如果不是中心房并且有portal
                  for (const endPortal of this.portals[shard][nextRoomName]) {
                    const endPortalName =
                      shard + "_" + nextRoomName + "_" + endPortal.x.toString() + "_" + endPortal.y.toString();

                    this.calcDistance(startPortalName, endPortalName);
                  }
                }
              }
            }
          }
        }
      }
    }
    for (const roomName in this.portals[shard]) {
      // eslint-disable-next-line no-prototype-builtins
      if (this.portals[shard].hasOwnProperty(roomName)) {
        for (const portal of this.portals[shard][roomName]) {
          if (
            portal.destination &&
            !portal.destination?.shard &&
            portal.destination.room &&
            portal.destination.x &&
            portal.destination.y
          ) {
            const portalName = shard + "_" + roomName + "_" + portal.x.toString() + "_" + portal.y.toString();
            const endPortalName =
              shard +
              "_" +
              portal.destination.room +
              "_" +
              portal.destination.x.toString() +
              "_" +
              portal.destination.y.toString();
            if (!this.distance[portalName]) this.distance[portalName] = {};
            this.distance[portalName][endPortalName] = 0;
          }
        }
      }
    }
  }

  /**
   * 建立 Portal 距离对象
   * @param start 起点 Portal
   * @param end 终点 Portal
   * @return x: number; y: number
   */
  public calcDistance(start: string, end: string): void {
    const length = this.calPosDis(start, end);
    if (!this.distance[start]) this.distance[start] = {};
    if (!this.distance[end]) this.distance[end] = {};
    this.distance[start][end] = length;
    this.distance[end][start] = length;
  }

  /**
   * 座标字符转为数字
   * @param pos 起点座标字符
   * @return x: number; y: number
   */
  public posToNum(pos: string): { x: number; y: number } {
    const posSplit = pos.split("_");
    const roomName = posSplit[1];
    const x = parseInt(posSplit[2]);
    const y = parseInt(posSplit[3]);
    const num = this.roomNameToNum(roomName);
    num.x = num.x * 49 + x;
    num.y = num.y * 49 + y;
    return num;
  }

  /**
   * 计算座标距离
   * @param posA 起点座标
   * @param posB 终点座标
   * @return 距离
   */
  public calPosDis(posA: string, posB: string): number {
    const numA = this.posToNum(posA);
    const numB = this.posToNum(posB);
    return Math.max(Math.abs(numA.x - numB.x), Math.abs(numA.y - numB.y));
  }

  /**
   * 房间名转为座标
   * @param roomName 房间名
   * @return x: number; y: number
   */
  public roomNameToNum(roomName: string): { x: number; y: number } {
    const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    let x = parseInt(<string>parsed?.[1]);
    let y = parseInt(<string>parsed?.[2]);
    if (roomName.indexOf("W") !== -1) {
      x = -x - 1;
    }
    if (roomName.indexOf("N") !== -1) {
      y = -y - 1;
    }
    return { x: x, y: y };
  }

  /**
   * 座标转为房间
   * @param pos 座标
   * @return 房间名
   */
  public numToRoomName(pos: { x: number; y: number }): string {
    let x = pos.x;
    let y = pos.y;
    let roomName = "";
    if (x >= 0) {
      roomName += "E";
    } else {
      roomName += "W";
      x = -x - 1;
    }
    roomName += x;
    if (y >= 0) {
      roomName += "S";
    } else {
      roomName += "N";
      y = -y - 1;
    }
    roomName += y;
    return roomName;
  }

  /**
   * 是否为过道房间
   * @param longitude 经度
   * @param latitude 纬度
   * @return Promise<void>
   */
  public isHighWay(longitude: number, latitude: number): boolean {
    return longitude % 10 === 0 || latitude % 10 === 0;
  }

  /**
   * 是否为中心房间
   * @param longitude 经度
   * @param latitude 纬度
   * @return Promise<void>
   */
  public isCenter(longitude: number, latitude: number): boolean {
    return longitude % 10 === 5 && latitude % 10 === 5;
  }

  /**
   * 寻路算法
   * @param startRoom 起点房间
   * @param endRoom 终点房间
   * @return void
   */
  public dijkstra(startRoom: string, endRoom: string): void {
    ret = { path: [], distance: 0, totalRooms: 0 };

    // Dijkstra
    const tmpDis: Record<string, number> = {};
    const dis: Record<string, number> = {}; // 表示距离起点的长度
    mid = {}; // 表示上一个节点，用来记录路径
    const queue: { room: string; dis: number; mid: string }[] = [
      {
        room: startRoom,
        dis: 0,
        mid: startRoom
      }
    ];
    let maxDis = 0;
    while (queue.length) {
      // queue.sort((a,b) => (a.dis - b.dis))
      let minIndex = 0;
      for (let i = 1; i < queue.length; i++) {
        if (queue[i].dis < queue[minIndex].dis) {
          minIndex = i;
        }
      }
      const top = queue[minIndex];
      queue.splice(minIndex, 1);
      if (top) {
        if (mid[top.room]) continue;
        if (top.dis % 100 == 0 && top.dis > maxDis) {
          maxDis = top.dis;
          console.log((top.dis / 15).toFixed(2) + "%");
        }
        dis[top.room] = top.dis;
        mid[top.room] = top.mid;

        if (top.room.indexOf(endRoom) != -1) {
          ret.distance = top.dis;

          this.pushPath(top.mid);
          ret.path.push(top.room);
          ret.totalRooms = totMid;

          break;
        }
        console.log("top", top.room, this.distance[top.room]);
        for (const nextRoomName in this.distance[top.room]) {
          // eslint-disable-next-line no-prototype-builtins
          if (this.distance[top.room].hasOwnProperty(nextRoomName)) {
            if (!dis[nextRoomName] && !mid[nextRoomName] && top.dis + this.distance[top.room][nextRoomName] < 1500) {
              if (!tmpDis[nextRoomName]) tmpDis[nextRoomName] = top.dis + this.distance[top.room][nextRoomName] + 1;
              if (top.dis + this.distance[top.room][nextRoomName] < tmpDis[nextRoomName]) {
                queue.push({
                  room: nextRoomName,
                  dis: top.dis + this.distance[top.room][nextRoomName],
                  mid: top.room
                });
                tmpDis[nextRoomName] = top.dis + this.distance[top.room][nextRoomName];
              }
              console.log("next", {
                room: nextRoomName,
                dis: top.dis + this.distance[top.room][nextRoomName]
              });
            }
          }
        }
      }
    }
    console.log(ret);
  }

  /**
   * 插入路径
   * @param roomName 房间名
   * @return void
   */
  public pushPath(roomName: string): void {
    totMid++;

    if (mid[roomName] && mid[roomName] != roomName) {
      this.pushPath(mid[roomName]);
    }
    ret.path.push(roomName);
  }
}
