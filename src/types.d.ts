interface VersionResult {
  ok: number;
  package: number;
  protocol: number;
  serverData: ServerData;
  seasonAccessCost: number;
  decorationConvertationCost: number;
  decorationPixelizationCost: number;
  users: number;
}

interface ServerData {
  customObjectTypes: Record<string, unknown>;
  historyChunkSize: number;
  renderer: {
    resources: Record<string, unknown>;
    metadata: Record<string, unknown>;
  };
  features: Feature[];
  shards: string[];
}

interface Feature {
  name: string;
  version: number;
  menuData?: unknown;
}

interface RoomHistoryResult {
  timestamp: number;
  room: string;
  base: number;
  ticks: Record<string, Record<string, unknown>>;
}

interface LeaderboardListResult {
  ok: number;
  list: Record<string, LeaderboardData>;
  count: number;
  users: Record<string, LeaderboardUser>;
}

interface LeaderboardData {
  _id: string;
  season: string;
  user: string;
  score: number;
  rank: number;
}

interface LeaderboardUser {
  _id: string;
  username: string;
  badge: BadgeData;
  gcl: number;
}

interface BadgeData {
  type: number | Record<string, string>;
  color1: string;
  color2: string;
  color3: string;
  param: number;
  flip: boolean;
  decoration?: string;
}

interface AuthSigninResult {
  ok: number;
  token: string;
}

interface AuthMeResult {
  ok: number;
  _id: string;
  email: string;
  username: string;
  cpu: number;
  badge: BadgeData;
  password: boolean;
  lastRespawnDate: number;
  notifyPrefs: {
    disabled: boolean;
    disabledOnMessages: boolean;
    sendOnline: boolean;
    interval: number;
    errorsInterval: number;
  };
  gcl: number;
  credits: number;
  money: number;
  subscriptionTokens: number;
  cpuShard: Record<string, number>;
  cpuShardUpdatedTime: number;
  runtime: Record<string, unknown>;
  powerExperimentations: number;
  powerExperimentationTime: number;
  resources: Record<string, number>;
  playerColor: unknown;
  promoPixels: unknown;
  steam: {
    id: string;
    displayName: string;
    ownership: number[];
    steamProfileLinkHidden: number;
  };
}

interface AuthQueryTokenResult {
  ok: number;
  token: Token;
}

interface Token {
  _id: string;
  full: boolean;
  token: string;
  description: string;
}

interface UserBadgeResult {
  ok: number;
  0: {
    n: number;
    nModified: number;
    ok: number;
  };
  1: {
    n: number;
    nModified: number;
    ok: number;
  };
}

interface DataBaseResult {
  ok: number;
  result: {
    n: number;
    nModified: number;
    ok: number;
  };
}

interface UserRespawnProhibitedRoomsResult {
  ok: number;
  rooms: string[];
}

interface UserSetActiveBranchResult {
  ok: number;
}

interface UserCloneBranchResult {
  ok: number;
  timestamp: number;
}

interface UserDeleteBranchResult {
  ok: number;
  timestamp: number;
}

interface NotifyPrefs {
  disabled: boolean;
  disabledOnMessages: boolean;
  sendOnline: boolean;
  interval: number;
  errorsInterval: number;
}

interface UserTutorialDoneResult {
  ok: number;
}

interface UserEmailResult {
  ok: number;
}

interface UserWorldStartRoomResult {
  ok: number;
  rooms: string[];
}

interface UserWorldStatusResult {
  ok: number;
  status: string;
}

interface UserBranchesResult {
  ok: number;
  list: UserBranch[];
}

interface UserBranch {
  _id: string;
  branch: string;
  activeWorld: boolean;
  activeSim: boolean;
}

interface UserGetCodeResult {
  ok: number;
  branch: string;
  modules: Record<string, string>;
}

interface UserSetCodeResult {
  ok: number;
  timestamp: number;
}

interface UserGetMemoryResult {
  ok: number;
  data: string;
}

interface UserSetMemoryResult {
  ok: number;
  result: { ok: number; n: number };
  ops: [
    {
      user: string;
      expression: string;
      shard: string;
      hidden: boolean;
      _id: string;
    }
  ];
  insertedCount: number;
  insertedIds: string[];
}

interface UserGetMemorySegmentResult {
  ok: number;
  data: string;
}

interface UserSetMemorySegmentResult {
  ok: number;
}

interface UserFindResult {
  ok: number;
  user: {
    _id: string;
    steam: { id: string; steamProfileLinkHidden: number };
    username: string;
    badge: BadgeData;
    gcl: number;
    power: number;
  };
}

interface UserStatsResult {
  ok: number;
  stats: {
    creepsProduced: number;
    energyConstruction: number;
    powerProcessed: number;
    energyControl: number;
    energyHarvested: number;
    energyCreeps: number;
    creepsLost: number;
  };
}

interface UserRoomsResult {
  ok: number;
  shards: Record<string, string[]>;
  reservations: Record<string, string[]>;
}

interface UserOverviewResult {
  ok: number;
  statsMax: number;
  totals: {
    creepsProduced: number;
    energyConstruction: number;
    powerProcessed: number;
    energyControl: number;
    energyHarvested: number;
    energyCreeps: number;
    creepsLost: number;
  };
  shards: Record<string, UserOverviewShardStats>;
}

interface UserOverviewShardStats {
  rooms: string[];
  stats: Record<string, UserOverviewRoomStats[]>;
  gametimes: number[];
}

interface UserOverviewRoomStats {
  value: number;
  endTime: number;
}

interface UserMoneyHistoryResult {
  ok: number;
  page: number;
  list: UserMoneyHistoryStats[];
  hasMore: boolean;
}

interface UserMoneyHistoryStats {
  _id: string;
  date: string;
  tick: number;
  user: string;
  type: string;
  balance: number;
  change: number;
  market: {
    resourceType: string;
    roomName: string;
    targetRoomName: string;
    price: number;
    npc: false;
    owner: string;
    dealer: string;
    amount: number;
  };
  shard: string;
}

interface UserConsoleResult {
  ok: number;
  result: { ok: number; n: number };
  ops: {
    user: string;
    expression: string;
    shard: string;
    _id: string;
  }[];
  insertedCount: number;
  insertedIds: string[];
}

interface UserNameResult {
  ok: number;
  username: string;
}

interface UserMessageListResult {
  ok: number;
  messages: Message[];
}

interface Message {
  _id: string;
  user?: string;
  respondent?: string;
  date: string;
  type: string;
  text: string;
  unread: boolean;
}

interface UserMessageIndexResult {
  ok: number;
  messages: { _id: string; message: Message }[];
  users: Record<
    string,
    {
      _id: string;
      username: string;
      badge: BadgeData;
    }
  >;
}

interface UserMessageUnreadCountResult {
  ok: number;
  count: number;
}

interface UserMessageSendResult {
  ok: number;
}

interface UserMessageMarkReadResult {
  ok: number;
  "0": number;
  "1": number;
  "2": {
    n: number;
    nModified: number;
    ok: number;
  };
}

interface GameMapStatsResult {
  ok: number;
  gameTime: number;
  stats: Record<string, unknown>;
  statsMax?: Record<string, number>;
  decorations: Record<string, unknown>;
  users: Record<string, unknown>;
}

interface GameGenUniqueObjectNameResult {
  ok: number;
  name: number;
}

interface GameCheckUniqueObjectNameResult {
  ok: number;
}

interface GamePlaceSpawnResult {
  ok: number;
  newbie: boolean;
}

interface GameCreateFlagResult {
  ok: number;
  result: { n: number; nModified: number; ok: number };
}

interface GameGenUniqueFlagNameResult {
  ok: number;
  name: number;
}

interface GameCheckUniqueFlagNameResult {
  ok: number;
}

interface GameChangeFlagColorResult {
  ok: number;
  result: { n: number; nModified: number; ok: number };
}

interface GameRemoveFlagResult {
  ok: number;
  result: { n: number; nModified: number; ok: number };
}

interface GameAddObjectIntentResult {
  ok: number;
}

interface GameCreateConstructionResult {
  ok: number;
  _id: string;
}

interface GameSetNotifyWhenAttackedResult {
  ok: number;
  result: { n: number; nModified: number; ok: number };
}

interface GameCreateInvaderResult {
  ok: number;
  result: {
    ok: number;
    n: number;
  };
  ops: unknown[];
  insertedCount: number;
  insertedIds: string[];
}

interface GameRemoveInvaderResult {
  ok: number;
  result: { n: number; nModified: number; ok: number };
}

interface GameTimeResult {
  ok: number;
  time: number;
}

interface GameWorldSizeResult {
  ok: number;
  width: number;
  height: number;
}

interface GameRoomDecorationsResult {
  ok: number;
  decorations: unknown[];
}

interface GameRoomObjectsResult {
  ok: number;
  objects: RoomObjects[];
  users: { _id: string; username: string }[];
}

interface RoomObjects {
  _id: string;
  type: string;
  room: string;
  x: number;
  y: number;
}

interface GameRoomTerrain {
  ok: number;
  terrain: { _id: string; room: string; terrain: string; type: string }[];
}

interface GameRoomStatus {
  ok: number;
  room: { _id: string; status: string };
}

interface GameRoomOverview {
  ok: number;
  owner: unknown;
  stats: Record<
    string,
    {
      value: number;
      endTime: number;
    }
  >;
  statsMax: Record<string, number>;
  totals: Record<string, number>;
}

interface GameMarketOrdersIndexResult {
  ok: number;
  list: {
    _id: string;
    count: number;
    avgPrice: number;
    stddevPrice: number;
  }[];
}

interface MyOrder {
  _id: string;
  createdTimestamp: number;
  user: string;
  active: boolean;
  type: string;
  amount: number;
  remainingAmount: number;
  resourceType: string;
  price: number;
  totalAmount: number;
  roomName: string;
  created: number;
}

interface GameMarketMyOrdersResult {
  ok: number;
  shards: Record<string, MyOrder[]>;
}

interface MarketOrder {
  _id: string;
  type: string;
  amount: number;
  remainingAmount: number;
  price: number;
  roomName: string;
}

interface GameMarketOrdersResult {
  ok: number;
  list: MarketOrder[];
}

interface OrderStats {
  _id: string;
  resourceType: string;
  date: string;
  amount: number;
  transactions: number;
  volume: number;
  avgPrice: number;
  stddevPrice: number;
}

interface GameMarketStatsResult {
  ok: number;
  stats: OrderStats[];
}

interface GameShardsInfoMockResult {
  ok: number;
  shards: {
    name: string;
    lastTicks: number[];
    cpuLimit: number;
    rooms: number;
    users: number;
    tick: number;
  }[];
}

interface GameShardsTickResult {
  ok: number;
  tick: number;
}

interface ExperimentalPvpResult {
  ok: number;
  pvp: Record<string, { time: number; rooms: { _id: string; lastPvpTime: number } }>;
}

interface ExperimentalNukeResult {
  ok: number;
  nukes: Record<
    string,
    { _id: string; type: string; room: string; x: number; y: number; landTime: number; launchRoomName: string }[]
  >;
}

interface ScreepsApiOptions {
  token?: string;
  username?: string;
  password?: string;
}

interface User {
  _id: string;
  username: string;
  badge: BadgeData;
  gcl: number;
  power: number;
}

interface RateLimit {
  limit: number;
  period: RatePeriod;
  remaining: number;
  reset: 0;
  toReset: 0;
}

type RatePeriod = "day" | "hour" | "minute";
type Method = "GET" | "POST";

interface RoomObjectDoc extends RoomObjects, Doc {
  id: string;
  shard: string;
  type: StructureConstant | "source" | "mineral";
  room: string;
  x: number;
  y: number;
}

interface RoomDoc extends Doc {
  room: string;
  shard: string;
  terrain: string;
  updateTime: number;
}

interface Doc {
  _id: string;
}

interface PortalDoc extends RoomObjectDoc {
  other: { disabled?: boolean; destination: { shard?: string; room: string; x?: number; y?: number } };
}
