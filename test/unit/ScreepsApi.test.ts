import * as nock from "nock";
import { ScreepsApi } from "@/api/ScreepsApi";

let screepsApi: ScreepsApi;
const baseAddress = "https://screeps.com";
/**
 * ScreepsApi test
 */
describe("ScreepsApi test", () => {
  beforeEach(() => {
    screepsApi = new ScreepsApi(baseAddress);
    nock.cleanAll();
  });
  it("ScreepsApi 可以被初始化", () => {
    expect(screepsApi).toBeInstanceOf(ScreepsApi);
  });
});
