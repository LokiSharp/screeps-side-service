import { ScreepsApi } from "@/api/ScreepsApi";
import { createConnection, MoreThan } from "typeorm";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as PromisePool from "@supercharge/promise-pool";

import * as fs from "fs";
import { RoomObjectEntity } from "@/entity/RoomObject";
import { RoomEntity } from "@/entity/Room";
import { PortalEntity } from "@/entity/Portal";

const connection = createConnection({
  type: "postgres",
  host: process.env.PG_HOST,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  port: parseInt(process.env.PG_PORT!),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [PortalEntity, RoomEntity, RoomObjectEntity],
  synchronize: true,
  logging: false
});

/**
 * 跨 Shard 工具类
 */
export class CrossShard {
  private api = new ScreepsApi("https://screeps.com");

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

  /**
   * 遍历 shard
   * @param roomName 房间名
   * @param shard Shard 名
   * @return Promise<void>
   */
  public async getRoom(roomName: string, shard: string): Promise<void> {
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
    await roomRepository.find({ shard, updateTime: MoreThan(Date.now() - 7 * 24 * 60 * 60 * 1000) }).then(res => {
      skipRoomNames = res.map(room => room.room);
    });

    const difference = roomNames
      .concat(skipRoomNames)
      .filter(v => !roomNames.includes(v) || !skipRoomNames.includes(v));
    // eslint-disable-next-line import/namespace
    await PromisePool.for(difference)
      .withConcurrency(10)
      .process(roomName => this.getRoom(roomName, shard));
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
   * 查找并插入 Portal
   * @return Promise<void>
   */
  public async selectAndInsertPortal(): Promise<void> {
    const roomObjectRepository = (await connection).getRepository(RoomObjectEntity);
    const portalRepository = (await connection).getRepository(PortalEntity);
    const portals = await roomObjectRepository.find({ where: { type: "portal" } });

    for (const portal of portals) {
      const { id, shard, room, x, y, _id } = portal;
      const other = portal.other as {
        disabled?: boolean;
        destination: { shard?: string; room: string; x?: number; y?: number };
      };
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parsedRoom = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(room)!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parsedDestination = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(other.destination.room || room)!;

      await portalRepository.save({
        id,
        shard,
        room,
        x,
        y,
        longitudeTag: parsedRoom[1],
        longitude: parseInt(parsedRoom[2]),
        latitudeTag: parsedRoom[3],
        latitude: parseInt(parsedRoom[4]),
        disabled: other.disabled === true,
        destinationShard: other.destination.shard || shard,
        destinationRoom: other.destination.room || room,
        destinationX: other.destination.x || x,
        destinationY: other.destination.y || y,
        destinationLongitudeTag: parsedDestination[1],
        destinationLongitude: parseInt(parsedDestination[2]),
        destinationLatitudeTag: parsedDestination[3],
        destinationLatitude: parseInt(parsedDestination[4]),
        _id
      });
    }
  }
}
