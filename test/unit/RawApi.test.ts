import { RawApi } from "@/api/RawApi";
import * as nock from "nock";
import * as versionMock from "@mock/versionMock.json";
import * as roomHistoryMock from "@mock/roomHistoryMock.json";
import * as leaderboardListMock from "@mock/leaderboardListMock.json";
import * as authSigninMock from "@mock/authSigninMock.json";
import * as authMeMock from "@mock/authMeMock.json";
import * as authQueryTokenMock from "@mock/authQueryTokenMock.json";
import * as userBadgeMock from "@mock/user/userBadgeMock.json";
import * as dataBaseResultMock from "@mock/dataBaseResultMock.json";
import * as userRespawnProhibitedRoomsMock from "@mock/user/userRespawnProhibitedRoomsMock.json";
import * as userSetActiveBranchMock from "@mock/user/userSetActiveBranchMock.json";
import * as userCloneBranchMock from "@mock/user/userCloneBranchMock.json";
import * as userDeleteBranchMock from "@mock/user/userDeleteBranchMock.json";
import * as userTutorialDoneMock from "@mock/user/userTutorialDoneMock.json";
import * as userEmailMock from "@mock/user/userEmailMock.json";
import * as userWorldStartRoomMock from "@mock/user/userWorldStartRoomMock.json";
import * as userWorldStatusMock from "@mock/user/userWorldStatusMock.json";
import * as userBranchesMock from "@mock/user/userBranchesMock.json";
import * as userGetCodeMock from "@mock/user/userGetCodeMock.json";
import * as userSetCodeMock from "@mock/user/userSetCodeMock.json";
import * as userGetMemoryMock from "@mock/user/userGetMemoryMock.json";
import * as userSetMemoryMock from "@mock/user/userSetMemoryMock.json";
import * as userGetMemorySegmentMock from "@mock/user/userGetMemorySegmentMock.json";
import * as userSetMemorySegmentMock from "@mock/user/userSetMemorySegmentMock.json";
import * as userFindMock from "@mock/user/userFindMock.json";
import * as userStatsMock from "@mock/user/userStatsMock.json";
import * as userRoomsMock from "@mock/user/userRoomsMock.json";
import * as userOverviewMock from "@mock/user/userOverviewMock.json";
import * as userMoneyHistoryMock from "@mock/user/userMoneyHistoryMock.json";
import * as userConsoleMock from "@mock/user/userConsoleMock.json";
import * as userNameMock from "@mock/user/userNameMock.json";
import * as UserMessageListMock from "@mock/user/userMessageListMock.json";
import * as userMessageIndexMock from "@mock/user/userMessageIndexMock.json";
import * as userMessageUnreadCountMock from "@mock/user/userMessageUnreadCountMock.json";
import * as userMessageSendMock from "@mock/user/userMessageSendMock.json";
import * as userMessageMarkReadMock from "@mock/user/userMessageMarkReadMock.json";
import * as gameGenUniqueObjectNameMock from "@mock/game/gameGenUniqueObjectNameMock.json";
import * as gameCheckUniqueObjectNameMock from "@mock/game/gameCheckUniqueObjectNameMock.json";
import * as gameMapStatsMock from "@mock/game/gameMapStatsMock.json";
import * as gamePlaceSpawnMock from "@mock/game/gamePlaceSpawnMock.json";
import * as gameCreateFlagMock from "@mock/game/gameCreateFlagMock.json";
import * as gameGenUniqueFlagNameMock from "@mock/game/gameGenUniqueFlagNameMock.json";
import * as gameCheckUniqueFlagNameMock from "@mock/game/gameCheckUniqueFlagNameMock.json";
import * as gameChangeFlagColorMock from "@mock/game/gameChangeFlagColorMock.json";
import * as gameRemoveFlagMock from "@mock/game/gameRemoveFlagMock.json";
import * as gameCreateConstructionMock from "@mock/game/gameCreateConstructionMock.json";
import * as gameSetNotifyWhenAttackedMock from "@mock/game/gameSetNotifyWhenAttackedMock.json";
import * as gameCreateInvaderMock from "@mock/game/gameCreateInvaderMock.json";
import * as gameRemoveInvaderMock from "@mock/game/gameRemoveInvaderMock.json";
import * as gameTimeMock from "@mock/game/gameTimeMock.json";
import * as gameWorldSizeMock from "@mock/game/gameWorldSizeMock.json";
import * as gameRoomDecorationsMock from "@mock/game/gameRoomDecorationsMock.json";
import * as gameRoomObjectsMock from "@mock/game/gameRoomObjectsMock.json";
import * as gameRoomTerrainMock from "@mock/game/gameRoomTerrainMock.json";
import * as gameRoomStatusMock from "@mock/game/gameRoomStatusMock.json";
import * as gameRoomOverviewMock from "@mock/game/gameRoomOverviewMock.json";
import * as gameMarketOrdersIndexMock from "@mock/game/gameMarketOrdersIndexMock.json";
import * as gameMarketMyOrdersMock from "@mock/game/gameMarketMyOrdersMock.json";
import * as gameMarketOrdersMock from "@mock/game/gameMarketOrdersMock.json";
import * as gameMarketStatsMock from "@mock/game/gameMarketStatsMock.json";
import * as gameShardsInfoMock from "@mock/game/gameShardsInfoMock.json";
import * as gameShardsTickMock from "@mock/game/gameShardsTickMock.json";
import * as experimentalPvpMock from "@mock/experimentalPvpMock.json";
import * as experimentalNukeMock from "@mock/experimentalNukeMock.json";

let rawApi: RawApi;
const baseAddress = "https://screeps.com";
/**
 * RawApi test
 */
describe("RawApi test", () => {
  beforeEach(() => {
    rawApi = new RawApi(baseAddress);
    nock.cleanAll();
  });
  it("RawApi ??????????????????", () => {
    expect(rawApi).toBeInstanceOf(RawApi);
  });
  it("????????????????????????", async () => {
    nock(baseAddress).get("/api/version").reply(200, versionMock).persist();
    const result = await rawApi.version();
    expect(result).toEqual(versionMock);
  });
  it("????????????????????? tick ?????????", async () => {
    nock(baseAddress).get(`/room-history/shard/room/0.json`).reply(200, roomHistoryMock).persist();
    const result = await rawApi.roomHistory("room", 0, "shard");
    expect(result).toEqual(roomHistoryMock);
  });
  it("??????????????????", async () => {
    nock(baseAddress)
      .get(`/api/leaderboard/list?limit=10&mode=mode&offset=1&season=season`)
      .reply(200, leaderboardListMock)
      .persist();
    const result = await rawApi.leaderboardList(10, "mode", 1, "season");
    expect(result).toEqual(leaderboardListMock);
  });
  it("?????????????????????????????????", async () => {
    nock(baseAddress).post(`/api/auth/signin`).reply(200, authSigninMock).persist();
    const result = await rawApi.authSignIn("email", "password");
    expect(result).toEqual(authSigninMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/auth/me`).reply(200, authMeMock).persist();
    const result = await rawApi.authMe();
    expect(result).toEqual(authMeMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/auth/query-token?token=token`).reply(200, authQueryTokenMock).persist();
    const result = await rawApi.authQueryToken("token");
    expect(result).toEqual(authQueryTokenMock);
  });
  it("?????????????????? token", async () => {
    nock(baseAddress).post(`/api/auth/signin`).reply(200, authSigninMock).persist();
    await rawApi.auth("email", "password");
    expect(rawApi.client.defaults.options.headers["x-token"]).toEqual(authSigninMock.token);
  });
  it("???????????????", async () => {
    const badge = {
      type: 1,
      color1: "#000000",
      color2: "#000000",
      color3: "#000000",
      param: 0,
      flip: true
    };
    nock(baseAddress).post(`/api/user/badge`, { badge }).reply(200, userBadgeMock).persist();
    const result = await rawApi.userBadge(badge);
    expect(result).toEqual(userBadgeMock);
  });
  it("?????????", async () => {
    nock(baseAddress).post(`/api/user/respawn`).reply(200, dataBaseResultMock).persist();
    const result = await rawApi.userRespawn();
    expect(result).toEqual(dataBaseResultMock);
  });
  it("???????????????????????????", async () => {
    nock(baseAddress).get(`/api/user/respawn-prohibited-rooms`).reply(200, userRespawnProhibitedRoomsMock).persist();
    const result = await rawApi.userRespawnProhibitedRooms();
    expect(result).toEqual(userRespawnProhibitedRoomsMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).post(`/api/user/set-active-branch`).reply(200, userSetActiveBranchMock).persist();
    const result = await rawApi.userSetActiveBranch("default", "activeWorld");
    expect(result).toEqual(userSetActiveBranchMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/user/clone-branch`).reply(200, userCloneBranchMock).persist();
    const result = await rawApi.userCloneBranch("default", "newName", "main");
    expect(result).toEqual(userCloneBranchMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/user/delete-branch`).reply(200, userDeleteBranchMock).persist();
    const result = await rawApi.userDeleteBranch("newName");
    expect(result).toEqual(userDeleteBranchMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/user/notify-prefs`).reply(200, dataBaseResultMock).persist();
    const prefs = {
      disabled: false,
      disabledOnMessages: false,
      sendOnline: true,
      interval: 5,
      errorsInterval: 5
    };
    const result = await rawApi.userNotifyPrefs(prefs);
    expect(result).toEqual(dataBaseResultMock);
  });
  it("??????????????????", async () => {
    nock(baseAddress).post(`/api/user/tutorial-done`).reply(200, userTutorialDoneMock).persist();
    const result = await rawApi.userTutorialDone();
    expect(result).toEqual(userTutorialDoneMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/user/email`).reply(200, userEmailMock).persist();
    const result = await rawApi.userEmail("userEmail");
    expect(result).toEqual(userEmailMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/user/world-start-room?shard=shard3`).reply(200, userWorldStartRoomMock).persist();
    const result = await rawApi.userWorldStartRoom("shard3");
    expect(result).toEqual(userWorldStartRoomMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/user/world-status`).reply(200, userWorldStatusMock).persist();
    const result = await rawApi.userWorldStatus();
    expect(result).toEqual(userWorldStatusMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).get(`/api/user/branches`).reply(200, userBranchesMock).persist();
    const result = await rawApi.userBranches();
    expect(result).toEqual(userBranchesMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).get(`/api/user/code?branch=default`).reply(200, userGetCodeMock).persist();
    const result = await rawApi.userGetCode("default");
    expect(result).toEqual(userGetCodeMock);
  });
  it("???????????????", async () => {
    const modules = { main: "module.exports.loop = function () {\n\n\n}" };
    nock(baseAddress).post(`/api/user/code`).reply(200, userSetCodeMock).persist();
    const result = await rawApi.userSetCode("branch", modules, null);
    expect(result).toEqual(userSetCodeMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).get(`/api/user/memory?path=path&shard=shard`).reply(200, userGetMemoryMock).persist();
    const result = await rawApi.userGetMemory("path", "shard");
    expect(result).toEqual(userGetMemoryMock);
  });
  it("???????????????", async () => {
    const value = { UserSetMemory: true };
    nock(baseAddress).post(`/api/user/memory`).reply(200, userSetMemoryMock).persist();
    const result = await rawApi.userSetMemory("path", value, "shard");
    expect(result).toEqual(userSetMemoryMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress)
      .get(`/api/user/memory-segment?segment=0&shard=shard`)
      .reply(200, userGetMemorySegmentMock)
      .persist();
    const result = await rawApi.userGetMemorySegment(0, "shard");
    expect(result).toEqual(userGetMemorySegmentMock);
  });
  it("?????????????????????", async () => {
    const data = "data";
    nock(baseAddress).post(`/api/user/memory-segment`).reply(200, userSetMemorySegmentMock).persist();
    const result = await rawApi.userSetMemorySegment(0, data, "shard");
    expect(result).toEqual(userSetMemorySegmentMock);
  });
  it("??????????????????????????????", async () => {
    nock(baseAddress).get(`/api/user/find?username=username`).reply(200, userFindMock).persist();
    const result = await rawApi.userFind("username");
    expect(result).toEqual(userFindMock);
  });
  it("????????? id ????????????", async () => {
    nock(baseAddress).get(`/api/user/find?id=id`).reply(200, userFindMock).persist();
    const result = await rawApi.userFindById("id");
    expect(result).toEqual(userFindMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/user/stats?id=id&interval=1440`).reply(200, userStatsMock).persist();
    const result = await rawApi.userStats("id", 1440);
    expect(result).toEqual(userStatsMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/user/rooms?id=id`).reply(200, userRoomsMock).persist();
    const result = await rawApi.userRooms("id");
    expect(result).toEqual(userRoomsMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/user/overview?statName=statName&interval=1440`).reply(200, userOverviewMock).persist();
    const result = await rawApi.userOverview("statName", 1440);
    expect(result).toEqual(userOverviewMock);
  });
  it("???????????????????????????", async () => {
    nock(baseAddress).get(`/api/user/money-history?page=0`).reply(200, userMoneyHistoryMock).persist();
    const result = await rawApi.userMoneyHistory(0);
    expect(result).toEqual(userMoneyHistoryMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).post(`/api/user/console`).reply(200, userConsoleMock).persist();
    const result = await rawApi.userConsole('console.log("hello")', "shard0");
    expect(result).toEqual(userConsoleMock);
  });
  it("??????????????????", async () => {
    nock(baseAddress).get(`/api/user/name`).reply(200, userNameMock).persist();
    const result = await rawApi.userName();
    expect(result).toEqual(userNameMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/user/messages/list?respondent=respondent`).reply(200, UserMessageListMock).persist();
    const result = await rawApi.userMessageList("respondent");
    expect(result).toEqual(UserMessageListMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/user/messages/index`).reply(200, userMessageIndexMock).persist();
    const result = await rawApi.userMessageIndex();
    expect(result).toEqual(userMessageIndexMock);
  });
  it("???????????????????????????", async () => {
    nock(baseAddress).get(`/api/user/messages/unread-count`).reply(200, userMessageUnreadCountMock).persist();
    const result = await rawApi.userMessageUnreadCount();
    expect(result).toEqual(userMessageUnreadCountMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/user/messages/send`).reply(200, userMessageSendMock).persist();
    const result = await rawApi.userMessageSend("respondent", "text");
    expect(result).toEqual(userMessageSendMock);
  });
  it("????????????????????????", async () => {
    nock(baseAddress).post(`/api/user/messages/mark-read`).reply(200, userMessageMarkReadMock).persist();
    const result = await rawApi.userMessageMarkRead("id");
    expect(result).toEqual(userMessageMarkReadMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).post(`/api/game/map-stats`).reply(200, gameMapStatsMock).persist();
    const result = await rawApi.gameMapStats(["room"], "statName", "shard");
    expect(result).toEqual(gameMapStatsMock);
  });
  it("????????????????????????", async () => {
    nock(baseAddress).post(`/api/game/gen-unique-object-name`).reply(200, gameGenUniqueObjectNameMock).persist();
    const result = await rawApi.gameGenUniqueObjectName("type", "shard");
    expect(result).toEqual(gameGenUniqueObjectNameMock);
  });
  it("????????????????????????", async () => {
    nock(baseAddress).post(`/api/game/check-unique-object-name`).reply(200, gameCheckUniqueObjectNameMock).persist();
    const result = await rawApi.gameCheckUniqueObjectName("type", "name", "shard");
    expect(result).toEqual(gameCheckUniqueObjectNameMock);
  });
  it("??????????????????", async () => {
    nock(baseAddress).post(`/api/game/place-spawn`).reply(200, gamePlaceSpawnMock).persist();
    const result = await rawApi.gamePlaceSpawn("room", 25, 25, "name", "shard");
    expect(result).toEqual(gamePlaceSpawnMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/game/create-flag`).reply(200, gameCreateFlagMock).persist();
    const result = await rawApi.gameCreateFlag("room", 25, 25, "name", 1, 1, "shard");
    expect(result).toEqual(gameCreateFlagMock);
  });
  it("????????????????????????", async () => {
    nock(baseAddress).post(`/api/game/gen-unique-flag-name`).reply(200, gameGenUniqueFlagNameMock).persist();
    const result = await rawApi.gameGenUniqueFlagName("shard");
    expect(result).toEqual(gameGenUniqueFlagNameMock);
  });
  it("????????????????????????", async () => {
    nock(baseAddress).post(`/api/game/check-unique-flag-name`).reply(200, gameCheckUniqueFlagNameMock).persist();
    const result = await rawApi.gameCheckUniqueFlagName("name", "shard");
    expect(result).toEqual(gameCheckUniqueFlagNameMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).post(`/api/game/change-flag-color`).reply(200, gameChangeFlagColorMock).persist();
    const result = await rawApi.gameChangeFlagColor("room", "name", 1, 1, "shard");
    expect(result).toEqual(gameChangeFlagColorMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/game/remove-flag`).reply(200, gameRemoveFlagMock).persist();
    const result = await rawApi.gameRemoveFlag("room", "name", "shard");
    expect(result).toEqual(gameRemoveFlagMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).post(`/api/game/add-object-intent`).reply(200, gameRemoveFlagMock).persist();
    const result = await rawApi.gameAddObjectIntent("", "room", "name", "intent", "shard");
    expect(result).toEqual(gameRemoveFlagMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).post(`/api/game/create-construction`).reply(200, gameCreateConstructionMock).persist();
    const result = await rawApi.gameCreateConstruction("room", 1, 1, "structureType", "name", "shard");
    expect(result).toEqual(gameCreateConstructionMock);
  });
  it("?????????????????????????????????", async () => {
    nock(baseAddress).post(`/api/game/set-notify-when-attacked`).reply(200, gameSetNotifyWhenAttackedMock).persist();
    const result = await rawApi.gameSetNotifyWhenAttacked("_id", true, "shard");
    expect(result).toEqual(gameSetNotifyWhenAttackedMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/game/create-invader`).reply(200, gameCreateInvaderMock).persist();
    const result = await rawApi.gameCreateInvader("room", 0, 0, "size", "type", true, "shard");
    expect(result).toEqual(gameCreateInvaderMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).post(`/api/game/remove-invader`).reply(200, gameRemoveInvaderMock).persist();
    const result = await rawApi.gameRemoveInvader("_id", "shard");
    expect(result).toEqual(gameRemoveInvaderMock);
  });
  it("???????????????", async () => {
    nock(baseAddress).get(`/api/game/time?shard=shard`).reply(200, gameTimeMock).persist();
    const result = await rawApi.gameTime("shard");
    expect(result).toEqual(gameTimeMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/game/world-size?shard=shard`).reply(200, gameWorldSizeMock).persist();
    const result = await rawApi.gameWorldSize("shard");
    expect(result).toEqual(gameWorldSizeMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress)
      .get(`/api/game/room-decorations?room=room&shard=shard`)
      .reply(200, gameRoomDecorationsMock)
      .persist();
    const result = await rawApi.gameRoomDecorations("room", "shard");
    expect(result).toEqual(gameRoomDecorationsMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/game/room-objects?room=room&shard=shard`).reply(200, gameRoomObjectsMock).persist();
    const result = await rawApi.gameRoomObjects("room", "shard");
    expect(result).toEqual(gameRoomObjectsMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/game/room-terrain?room=room&shard=shard`).reply(200, gameRoomTerrainMock).persist();
    const result = await rawApi.gameRoomTerrain("room", "shard");
    expect(result).toEqual(gameRoomTerrainMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/game/room-status?room=room&shard=shard`).reply(200, gameRoomStatusMock).persist();
    const result = await rawApi.gameRoomStatus("room", "shard");
    expect(result).toEqual(gameRoomStatusMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/game/room-overview?room=room&shard=shard`).reply(200, gameRoomOverviewMock).persist();
    const result = await rawApi.gameRoomOverview("room", "shard");
    expect(result).toEqual(gameRoomOverviewMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/game/market/orders-index?shard=shard`).reply(200, gameMarketOrdersIndexMock).persist();
    const result = await rawApi.gameMarketOrdersIndex("shard");
    expect(result).toEqual(gameMarketOrdersIndexMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/game/market/my-orders?shard=shard`).reply(200, gameMarketMyOrdersMock).persist();
    const result = await rawApi.gameMarketMyOrders("shard");
    expect(result).toEqual(gameMarketMyOrdersMock);
  });
  it("????????????????????????", async () => {
    nock(baseAddress)
      .get(`/api/game/market/orders?resourceType=resourceType&shard=shard`)
      .reply(200, gameMarketOrdersMock)
      .persist();
    const result = await rawApi.gameMarketOrders("resourceType", "shard");
    expect(result).toEqual(gameMarketOrdersMock);
  });
  it("????????????????????????????????????", async () => {
    nock(baseAddress)
      .get(`/api/game/market/stats?resourceType=resourceType&shard=shard`)
      .reply(200, gameMarketStatsMock)
      .persist();
    const result = await rawApi.gameMarketStats("resourceType", "shard");
    expect(result).toEqual(gameMarketStatsMock);
  });
  it("????????? Shard ??????", async () => {
    nock(baseAddress).get(`/api/game/shards/info`).reply(200, gameShardsInfoMock).persist();
    const result = await rawApi.gameShardsInfo();
    expect(result).toEqual(gameShardsInfoMock);
  });
  it("????????? Shard Tick ??????", async () => {
    nock(baseAddress).get(`/api/game/shards/tick?shard=shard`).reply(200, gameShardsTickMock).persist();
    const result = await rawApi.gameShardsTick("shard");
    expect(result).toEqual(gameShardsTickMock);
  });
  it("????????? Pvp ??????", async () => {
    nock(baseAddress).get(`/api/experimental/pvp?interval=10`).reply(200, experimentalPvpMock).persist();
    const result = await rawApi.experimentalPvp(10);
    expect(result).toEqual(experimentalPvpMock);
  });
  it("?????????????????????", async () => {
    nock(baseAddress).get(`/api/experimental/nukes`).reply(200, experimentalNukeMock).persist();
    const result = await rawApi.experimentalNuke();
    expect(result).toEqual(experimentalNukeMock);
  });
});
