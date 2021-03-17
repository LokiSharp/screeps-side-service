import RawApi from "../src/RawApi";

/**
 * RawApi test
 */
describe("RawApi test", () => {
  it("RawApi 可以被初始化", () => {
    expect(new RawApi()).toBeInstanceOf(RawApi);
  });
});
