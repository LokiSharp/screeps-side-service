import { EntitySchema } from "typeorm";

export interface PortalDistance {
  id: number;
  startPortalName: string;
  endPortalName: string;
  distance: number;
}

export const PortalDistanceEntity = new EntitySchema<PortalDistance>({
  name: "portal_distance",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment"
    },
    startPortalName: {
      name: "start_portal_name",
      type: "varchar",
      length: 32,
      nullable: false
    },
    endPortalName: {
      name: "end_portal_name",
      type: "varchar",
      length: 32,
      nullable: false
    },
    distance: {
      type: "smallint",
      nullable: false
    }
  },
  uniques: [{ name: "UQ_PORTAL_PAIR", columns: ["startPortalName", "endPortalName"] }]
});
