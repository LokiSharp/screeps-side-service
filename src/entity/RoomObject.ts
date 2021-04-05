import { EntitySchema } from "typeorm";

export interface RoomObject {
  id: string;
  shard: string;
  room: string;
  x: number;
  y: number;
  type: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  other: object;
  _id: string;
}

export const RoomObjectEntity = new EntitySchema<RoomObject>({
  name: "room_object",
  columns: {
    id: {
      type: "varchar",
      length: 32,
      nullable: false
    },
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
    x: {
      type: "smallint",
      nullable: false
    },
    y: {
      type: "smallint",
      nullable: false
    },
    type: {
      type: "varchar",
      length: 16,
      nullable: false
    },
    other: {
      type: "jsonb"
    },
    _id: {
      type: "varchar",
      length: 64,
      nullable: false,
      unique: true,
      primary: true
    }
  }
});
