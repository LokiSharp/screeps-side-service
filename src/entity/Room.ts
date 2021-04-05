import { EntitySchema } from "typeorm";

export interface Room {
  room: string;
  shard: string;
  terrain: string;
  updateTime: number;
  _id: string;
}

export const RoomEntity = new EntitySchema<Room>({
  name: "room",
  columns: {
    shard: {
      type: "varchar",
      length: 16,
      nullable: false
    },
    room: {
      type: "varchar",
      length: 8,
      nullable: false
    },
    terrain: {
      type: "varchar",
      length: 2500,
      nullable: false
    },
    updateTime: {
      name: "update_time",
      type: "bigint",
      nullable: false
    },
    _id: {
      type: "varchar",
      length: 32,
      nullable: false,
      unique: true,
      primary: true
    }
  }
});
