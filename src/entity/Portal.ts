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
      nullable: false,
      length: 32
    },
    shard: {
      type: "varchar",
      nullable: false,
      length: 16
    },
    room: {
      type: "varchar",
      nullable: false,
      length: 8
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
      type: "varchar",
      nullable: false,
      length: 16
    },
    destinationRoom: {
      type: "varchar",
      nullable: false,
      length: 8
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
      type: "smallint",
      nullable: false
    },
    destinationLatitude: {
      type: "smallint",
      nullable: false
    },
    _id: {
      type: "varchar",
      nullable: false,
      length: 64,
      unique: true,
      primary: true
    }
  }
});
