import { ScreepsApi } from "@/api/ScreepsApi";
import { createConnection } from "typeorm";
import { Portal, PortalEntity } from "@/entity/Portal";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as PromisePool from "@supercharge/promise-pool";

import { Pool } from "pg";
import * as fs from "fs";

const connection = createConnection({
  type: "postgres",
  host: process.env.PG_HOST,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  port: parseInt(process.env.PG_PORT!),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [PortalEntity],
  synchronize: true,
  logging: false
});

const pool = new Pool({
  host: process.env.PG_HOST,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  port: parseInt(process.env.PG_PORT!),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
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
    const roomObjects = ((await this.api.gameRoomObjects(roomName, shard)).objects as RoomObjectDoc[])
      .filter(
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
      )
      .map(object => {
        for (const key of Object.keys(object)) {
          if (key.includes("_")) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            object[key.replace("_", "")] = object[key];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delete object[key];
          }
        }
        object._id = shard + object.room + object.id;
        return object;
      });

    if (roomObjects.length > 0) {
      for (const roomObject of roomObjects) {
        roomObject.shard = shard;
        try {
          const { type, id, shard, room, x, y, _id } = roomObject;
          Object.keys(roomObject).forEach(key =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ["type", "id", "shard", "room", "x", "y", "_id"].includes(key) ? delete roomObject[key] : ""
          );

          if (type === "controller") {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            delete roomObject["sign"];
          }
          await pool.query(
            `INSERT INTO room_object (type, id, shard, room, x, y, other, _id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
            [type, id, shard, room, x, y, JSON.stringify(roomObject), _id]
          );
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
    const terrain = await this.getRoomTerrain(roomName, shard);

    const roomDocs = ((await pool.query(`SELECT room, shard FROM room WHERE room = $1 AND shard = $2;`, [
      roomName,
      shard
    ])) as unknown) as { room: string; shard: string }[];
    if (roomDocs.length > 0) {
      await pool.query(`DELETE FROM room_object WHERE room = $1 AND shard = $2;`, [roomName, shard]);
    }

    await this.getRoomObjectInRoom(roomName, shard);

    try {
      await pool.query(
        `INSERT INTO room (room, shard, terrain, _id, updatedtime) VALUES
          ($1, $2, $3, $4, $5);`,
        [roomName, shard, terrain, shard + roomName, Date.now()]
      );
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
    await pool
      .query(`SELECT room FROM room WHERE shard = $1 AND updatedtime > $2;`, [
        shard,
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ])
      .then(res => {
        skipRoomNames = ((res.rows as unknown) as { room: string }[]).map(roomdoc => roomdoc.room);
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
    // for (const shard of ["shard0", "shard1", "shard2", "shard3"]) {
    //   await this.traversalShard(shard);
    // }
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
    let portals: PortalDoc[] = [];
    await pool
      .query(`SELECT type, id, shard, room, x, y, other, _id FROM room_object WHERE type = $1;`, ["portal"])
      .then(res => {
        portals = (res.rows as unknown) as PortalDoc[];
      });

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
    // const portalRepository = (await connection).getRepository<Portal>(PortalEntity);
    let portals: PortalDoc[] = [];
    await pool
      .query(`SELECT type, id, shard, room, x, y, other, _id FROM room_object WHERE type = $1;`, ["portal"])
      .then(res => {
        portals = (res.rows as unknown) as PortalDoc[];
      });
    for (const portal of portals) {
      const { id, shard, room, x, y, _id, other } = portal;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parsedRoom = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(room)!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const parsedDestination = /^([WE])([0-9]+)([NS])([0-9]+)$/.exec(other.destination.room || room)!;

      const portalDTO: Portal = {
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
      };
      await (await connection).createQueryBuilder().insert().into(PortalEntity).values(portalDTO).execute();
      // await portalRepository.save(portalDTO);
    }
  }
}
