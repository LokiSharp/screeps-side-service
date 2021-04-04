import * as nock from "nock";
import { CrossShard } from "@/tools/crossShard";

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
      const result = await crossShard.traversalShard("shard0");
      console.log(result);
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
    "selectAndInsertPortal",
    async () => {
      await crossShard.selectAndInsertPortal();
    },
    6 * 60 * 60 * 1000
  );
});
