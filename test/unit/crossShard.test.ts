import * as nock from "nock";
import { CrossShard } from "@/tools/crossShard";
import * as fs from "fs";

let crossShard: CrossShard;
/**
 * CrossShard test
 */
describe("CrossShard test", () => {
  beforeEach(() => {
    nock.cleanAll();
    crossShard = new CrossShard();
  });
  it("ScreepsApi 可以被初始化", () => {
    expect(crossShard).toBeInstanceOf(CrossShard);
  });
  it("getRoomObjectInRoom", async () => {
    await crossShard.getRoomObjectInRoom("W0N0", "shard0");
  });
  it("getRoom", async () => {
    await crossShard.getRoom("W0N0", "shard0");
  });
  it(
    "traversalShard",
    async () => {
      await crossShard.traversalShard("shard0");
    },
    60 * 60 * 1000
  );
  it(
    "getAllRoomObject",
    async () => {
      await crossShard.getAllRoomObject();
    },
    6 * 60 * 60 * 1000
  );

  it(
    "solve",
    async () => {
      await crossShard.solve();
    },
    6 * 60 * 60 * 1000
  );

  it(
    "clacInnerShardPortalDistance",
    async () => {
      await crossShard.buildPortals("shard0");
      await crossShard.buildPortals("shard1");
      await crossShard.buildPortals("shard2");
      await crossShard.buildPortals("shard3");

      crossShard.clacCrossShardPortalDistance("shard0", "shard1");
      crossShard.clacCrossShardPortalDistance("shard1", "shard2");
      crossShard.clacCrossShardPortalDistance("shard2", "shard3");

      crossShard.addRoomPosObject({
        shard: "shard3",
        room: "W35N51",
        x: 25,
        y: 25,
        destination: { room: "W35N51" }
      } as Portal);

      crossShard.addRoomPosObject({
        shard: "shard2",
        room: "W11N18",
        x: 25,
        y: 25,
        destination: { room: "W11N18" }
      } as Portal);

      crossShard.clacInnerShardPortalDistance("shard0");
      crossShard.clacInnerShardPortalDistance("shard1");
      crossShard.clacInnerShardPortalDistance("shard2");
      crossShard.clacInnerShardPortalDistance("shard3");

      const startRoom = "shard3_W35N51_25_25";
      const endRoom = "shard2_W11N18_25_25";

      const startTime = Date.now();
      crossShard.dijkstra(startRoom, endRoom);
      console.log(Date.now() - startTime);

      try {
        fs.writeFileSync("portals.json", JSON.stringify(crossShard.distance));
        console.log("JSON data is saved.");
      } catch (err) {
        console.error(err);
      }

      console.log("");
    },
    6 * 60 * 60 * 1000
  );
});
