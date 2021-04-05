import { EntitySchema } from "typeorm";

export interface Portal {
  id: string;
  shard: string;
  room: string;
  x: number;
  y: number;
  longitudeTag: string;
  latitudeTag: string;
  longitude: number;
  latitude: number;
  disabled: boolean;
  destinationShard: string;
  destinationRoom: string;
  destinationX: number;
  destinationY: number;
  destinationLongitudeTag: string;
  destinationLatitudeTag: string;
  destinationLongitude: number;
  destinationLatitude: number;
  _id: string;
}

export const PortalEntity = new EntitySchema<Portal>({
  name: "portal",
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
    longitudeTag: {
      name: "longitude_tag",
      type: "char",
      nullable: false
    },
    latitudeTag: {
      name: "latitude_tag",
      type: "char",
      nullable: false
    },
    longitude: {
      type: "smallint",
      nullable: false
    },
    latitude: {
      type: "smallint",
      nullable: false
    },
    disabled: {
      type: Boolean,
      nullable: false
    },
    destinationShard: {
      name: "destination_shard",
      type: "varchar",
      length: 16,
      nullable: false
    },
    destinationRoom: {
      name: "destination_room",
      type: "varchar",
      length: 8,
      nullable: false
    },
    destinationX: {
      name: "destination_x",
      type: "smallint",
      nullable: false
    },
    destinationY: {
      name: "destination_y",
      type: "smallint",
      nullable: false
    },
    destinationLongitudeTag: {
      name: "destination_longitude_tag",
      type: "char",
      nullable: false
    },
    destinationLatitudeTag: {
      name: "destination_latitude_tag",
      type: "char",
      nullable: false
    },
    destinationLongitude: {
      name: "destination_longitude",
      type: "smallint",
      nullable: false
    },
    destinationLatitude: {
      name: "destination_latitude",
      type: "smallint",
      nullable: false
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
