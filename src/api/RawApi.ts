import got, { Got } from "got";

/**
 * 初始化访问限制
 * @param limit 限制
 * @param period 周期
 * @return 访问限制
 */
function initRateLimit(limit: number, period: RatePeriod): RateLimit {
  return {
    limit,
    period,
    remaining: limit,
    reset: 0,
    toReset: 0
  };
}

/**
 * RawApi 类
 */
export class RawApi {
  public client: Got;
  public rateLimits = {
    global: initRateLimit(120, "minute"),
    GET: {
      "api/game/room-terrain": initRateLimit(360, "hour"),
      "api/user/code": initRateLimit(60, "hour"),
      "api/user/memory": initRateLimit(1440, "day"),
      "api/user/memory-segment": initRateLimit(360, "hour"),
      "api/game/market/orders-index": initRateLimit(60, "hour"),
      "api/game/market/orders": initRateLimit(60, "hour"),
      "api/game/market/my-orders": initRateLimit(60, "hour"),
      "api/game/market/stats": initRateLimit(60, "hour"),
      "api/game/user/money-history": initRateLimit(60, "hour")
    },
    POST: {
      "api/user/console": initRateLimit(360, "hour"),
      "api/game/map-stats": initRateLimit(60, "hour"),
      "api/user/code": initRateLimit(240, "day"),
      "api/user/set-active-branch": initRateLimit(240, "day"),
      "api/user/memory": initRateLimit(240, "day"),
      "api/user/memory-segment": initRateLimit(60, "hour")
    }
  };

  /**
   * 获取访问限制
   * @param method 方法
   * @param path 路径
   * @return 访问限制
   */
  public getRateLimit(method: Method, path: string): RateLimit {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.rateLimits[method][path] || this.rateLimits.global;
  }

  /**
   * RawApi 类构造函数
   * @param baseAddress 基础地址
   */
  public constructor(baseAddress: string) {
    this.client = got.extend({
      mutableDefaults: true,
      prefixUrl: baseAddress,
      hooks: {
        beforeRequest: [
          options => {
            console.log(options.method, options.path);
          }
        ]
      }
    });
  }

  /**
   * 获取服务器版本
   *
   * @return 服务器版本响应
   */
  public async version(): Promise<VersionResult> {
    return this.client.get("api/version").json();
  }

  /**
   * 获取房间某一 tick 的历史
   * @param roomName 房间名
   * @param tick tick 值
   * @param shard Shard 名
   * @return 房间历史响应
   */
  public async roomHistory(roomName: string, tick: number, shard: string): Promise<RoomHistoryResult> {
    return this.client.get(`room-history/${shard}/${roomName}/${tick}.json`).json();
  }

  // region Leaderboard
  /**
   * 获取排行榜
   * @param limit 限制数
   * @param mode 模式
   * @param offset 偏移量
   * @param season 赛季
   * @return 排行榜响应
   */
  public async leaderboardList(
    limit: number,
    mode: string,
    offset: number,
    season: string
  ): Promise<LeaderboardListResult> {
    return this.client
      .get(`api/leaderboard/list`, {
        searchParams: {
          limit,
          mode,
          offset,
          season
        }
      })
      .json();
  }
  // endregion

  // region Auth
  /**
   * 用帐号密码登入服务器
   * @param email 帐号
   * @param password 密码
   * @return 登入响应
   */
  public async authSignIn(email: string, password: string): Promise<AuthSigninResult> {
    return this.client.post("api/auth/signin", { json: { email, password } }).json();
  }

  /**
   * 获取用户状态
   * @return 用户状态响应
   */
  public async authMe(): Promise<AuthMeResult> {
    return this.client.get("api/auth/me").json();
  }

  /**
   * 获取令牌状态
   * @param token 令牌
   * @return 获取令牌状态响应
   */
  public async authQueryToken(token: string): Promise<AuthQueryTokenResult> {
    return this.client.get("api/auth/query-token", { searchParams: { token } }).json();
  }

  /**
   * 用帐号密码登入服务器
   * @param email 帐号
   * @param password 密码
   * @return 登入响应结果的 bool 值
   */
  public async auth(email: string, password: string): Promise<void> {
    const authSignInResult = await this.authSignIn(email, password);
    const updatedOptions = {
      headers: { "x-token": authSignInResult.token, "x-username": authSignInResult.token }
    };
    this.client.defaults.options = got.mergeOptions(this.client.defaults.options, updatedOptions);
  }

  // endregion

  // region User
  /**
   * 设置徽章
   * @param badge 徽章参数
   * @return 设置徽章响应
   */
  public async userBadge(badge: BadgeData): Promise<UserBadgeResult> {
    return this.client.post("api/user/badge", { json: { badge } }).json();
  }

  /**
   * 重生
   * @return 重生响应
   */
  public async userRespawn(): Promise<DataBaseResult> {
    return this.client.post("api/user/respawn", {}).json();
  }

  /**
   * 获取禁止重生房间
   * @return 获取禁止重生房间响应
   */
  public async userRespawnProhibitedRooms(): Promise<UserRespawnProhibitedRoomsResult> {
    return this.client.get("api/user/respawn-prohibited-rooms").json();
  }

  /**
   * 设置活跃分支
   * @param branch 分支名
   * @param activeName 适用范围
   * @return 设置活跃分支响应
   */
  public async userSetActiveBranch(branch: string, activeName: string): Promise<UserSetActiveBranchResult> {
    return this.client.post("api/user/set-active-branch", { json: { branch, activeName } }).json();
  }

  /**
   * 克隆分支
   * @param branch 原分支名
   * @param newName 新分支名
   * @param defaultModules 默认模块
   * @return 克隆分支响应
   */
  public async userCloneBranch(
    branch: string,
    newName: string,
    defaultModules: string
  ): Promise<UserCloneBranchResult> {
    return this.client
      .post("api/user/clone-branch", {
        json: {
          branch,
          newName,
          defaultModules
        }
      })
      .json();
  }

  /**
   * 删除分支
   * @param branch 分支名
   * @return 删除分支响应
   */
  public async userDeleteBranch(branch: string): Promise<UserDeleteBranchResult> {
    return this.client.post("api/user/delete-branch", { json: { branch } }).json();
  }

  /**
   * 设置通知
   * @param prefs 通知设置
   * @return 设置通知响应
   */
  public async userNotifyPrefs(prefs: NotifyPrefs): Promise<DataBaseResult> {
    return this.client.post("api/user/notify-prefs", { json: { prefs } }).json();
  }

  /**
   * 教程已完成
   * @return 教程已完成响应
   */
  public async userTutorialDone(): Promise<UserTutorialDoneResult> {
    return this.client.post("api/user/tutorial-done", { json: {} }).json();
  }

  /**
   * 设置邮箱
   * @param email 邮箱地址
   * @return 设置邮箱响应
   */
  public async userEmail(email: string): Promise<UserEmailResult> {
    return this.client.post("api/user/email", { json: { email } }).json();
  }

  /**
   * 获取起始房间
   * @param shard Shard 名
   * @return 获取起始房间响应
   */
  public async userWorldStartRoom(shard: string): Promise<UserWorldStartRoomResult> {
    return this.client
      .get("api/user/world-start-room", {
        searchParams: {
          shard
        }
      })
      .json();
  }

  /**
   * 获取世界状态
   * @return 获取世界状态响应
   */
  public async userWorldStatus(): Promise<UserWorldStatusResult> {
    return this.client.get("api/user/world-status").json();
  }

  /**
   * 获取分支
   * @return 获取分支响应
   */
  public async userBranches(): Promise<UserBranchesResult> {
    return this.client.get("api/user/branches").json();
  }

  // region Code
  /**
   * 获取代码
   * @param branch 分支名
   * @return 获取代码响应
   */
  public async userGetCode(branch: string): Promise<UserGetCodeResult> {
    return this.client
      .get("api/user/code", {
        searchParams: {
          branch
        }
      })
      .json();
  }

  /**
   * 设置代码
   * @param branch 分支名
   * @param modules 代码模块
   * @param _hash 代码 hash
   * @return 设置代码响应
   */
  public async userSetCode(
    branch: string,
    modules: Record<string, string>,
    _hash: string | null
  ): Promise<UserSetCodeResult> {
    return this.client
      .post("api/user/code", {
        json: {
          branch,
          modules,
          _hash
        }
      })
      .json();
  }
  // endregion
  // region Memory
  /**
   * 获取记忆
   * @param path 路径
   * @param shard Shard 名
   * @return 获取记忆响应
   */
  public async userGetMemory(path: string, shard: string): Promise<UserGetMemoryResult> {
    return this.client
      .get("api/user/memory", {
        searchParams: {
          path,
          shard
        }
      })
      .json();
  }

  /**
   * 设置记忆
   * @param path 路径
   * @param value 路径
   * @param shard Shard 名
   * @return 获取记忆响应
   */
  public async userSetMemory(
    path: string,
    value: Record<string, unknown>,
    shard: string
  ): Promise<UserSetMemoryResult> {
    return this.client
      .post("api/user/memory", {
        json: {
          path,
          value,
          shard
        }
      })
      .json();
  }

  /**
   * 获取记忆分片
   * @param segment 分片名
   * @param shard Shard 名
   * @return 获取记忆分片响应
   */
  public async userGetMemorySegment(segment: number, shard: string): Promise<UserGetMemorySegmentResult> {
    return this.client
      .get("api/user/memory-segment", {
        searchParams: {
          segment,
          shard
        }
      })
      .json();
  }

  /**
   * 设置记忆
   * @param segment 路径
   * @param data 路径
   * @param shard Shard 名
   * @return 获取记忆响应
   */
  public async userSetMemorySegment(segment: number, data: string, shard: string): Promise<UserSetMemorySegmentResult> {
    return this.client
      .post("api/user/memory-segment", {
        json: {
          segment,
          data,
          shard
        }
      })
      .json();
  }

  // endregion
  /**
   * 通过用户名查找用户
   * @param username 用户名
   * @return 通过用户名查找用户响应
   */
  public async userFind(username: string): Promise<UserFindResult> {
    return this.client
      .get("api/user/find", {
        searchParams: {
          username
        }
      })
      .json();
  }

  /**
   * 通过用户 id 查找用户
   * @param id 用户 id
   * @return 通过用户 id 查找用户响应
   */
  public async userFindById(id: string): Promise<UserFindResult> {
    return this.client
      .get("api/user/find", {
        searchParams: {
          id
        }
      })
      .json();
  }

  /**
   * 获取用户信息
   * @param id 用户 id
   * @param interval 间隔
   * @return 获取用户信息响应
   */
  public async userStats(id: string, interval: number): Promise<UserStatsResult> {
    return this.client
      .get("api/user/stats", {
        searchParams: {
          id,
          interval
        }
      })
      .json();
  }

  /**
   * 查找用户房间
   * @param id 用户 id
   * @return 查找用户房间响应
   */
  public async userRooms(id: string): Promise<UserRoomsResult> {
    return this.client
      .get("api/user/rooms", {
        searchParams: {
          id
        }
      })
      .json();
  }

  /**
   * 获取用户概览
   * @param statName 状态名
   * @param interval 间隔
   * @return 获取用户概览响应
   */
  public async userOverview(statName: string, interval: number): Promise<UserOverviewResult> {
    return this.client
      .get("api/user/overview", {
        searchParams: {
          statName,
          interval
        }
      })
      .json();
  }

  /**
   * 获取用户交易历史
   * @param page 页数
   * @return 获取用户交易历史响应
   */
  public async userMoneyHistory(page: number): Promise<UserMoneyHistoryResult> {
    return this.client
      .get("api/user/money-history", {
        searchParams: {
          page
        }
      })
      .json();
  }

  /**
   * 发送终端命令
   * @param expression 表达式
   * @param shard Shard 名
   * @return 发送终端命令响应
   */
  public async userConsole(expression: string, shard: string): Promise<UserConsoleResult> {
    return this.client
      .post("api/user/console", {
        json: {
          expression,
          shard
        }
      })
      .json();
  }

  /**
   * 获取用户名
   * @return 获取用户名响应
   */
  public async userName(): Promise<UserNameResult> {
    return this.client.get("api/user/name", {}).json();
  }

  // region Message
  /**
   * 获取消息列表
   * @param respondent 应答者 id
   * @return 获取消息列表响应
   */
  public async userMessageList(respondent: string): Promise<UserMessageListResult> {
    return this.client
      .get("api/user/messages/list", {
        searchParams: {
          respondent
        }
      })
      .json();
  }

  /**
   * 获取消息索引
   * @return 获取消息索引
   */
  public async userMessageIndex(): Promise<UserMessageIndexResult> {
    return this.client.get("api/user/messages/index").json();
  }

  /**
   * 获取未读消息计数
   * @return 未读消息计数响应
   */
  public async userMessageUnreadCount(): Promise<UserMessageUnreadCountResult> {
    return this.client.get("api/user/messages/unread-count").json();
  }

  /**
   * 发送消息
   * @param respondent 应答者 id
   * @param text 消息文本
   * @return 发送消息响应
   */
  public async userMessageSend(respondent: string, text: string): Promise<UserMessageSendResult> {
    return this.client
      .post("api/user/messages/send", {
        json: {
          respondent,
          text
        }
      })
      .json();
  }

  /**
   * 消息标为已读
   * @param id 消息 id
   * @return 消息标为已读响应
   */
  public async userMessageMarkRead(id: string): Promise<UserMessageMarkReadResult> {
    return this.client
      .post("api/user/messages/mark-read", {
        json: {
          id
        }
      })
      .json();
  }
  // endregion
  // endregion
  // region Game

  /**
   * 获取地图状态
   * @param rooms 房间名
   * @param statName 状态名
   * @param shard Shard 名
   * @return 获取地图状态响应
   */
  public async gameMapStats(rooms: string[], statName: string, shard: string): Promise<GameMapStatsResult> {
    return this.client
      .post("api/game/map-stats", {
        json: {
          rooms,
          statName,
          shard
        }
      })
      .json();
  }

  /**
   * 生成唯一对象名
   * @param type 对象类型
   * @param shard Shard 名
   * @return 生成唯一对象名响应
   */
  public async gameGenUniqueObjectName(type: string, shard: string): Promise<GameGenUniqueObjectNameResult> {
    return this.client
      .post("api/game/gen-unique-object-name", {
        json: {
          type,
          shard
        }
      })
      .json();
  }

  /**
   * 检查唯一对象名
   * @param type 对象类型
   * @param name 对象名
   * @param shard Shard 名
   * @return 检查唯一对象名响应
   */
  public async gameCheckUniqueObjectName(
    type: string,
    name: string,
    shard: string
  ): Promise<GameCheckUniqueObjectNameResult> {
    return this.client
      .post("api/game/check-unique-object-name", {
        json: {
          type,
          name,
          shard
        }
      })
      .json();
  }

  /**
   * 设置出生点
   * @param room 房间名
   * @param x x 座标
   * @param y x 座标
   * @param name Spawn 名
   * @param shard Shard 名
   * @return 设置出生点响应
   */
  public async gamePlaceSpawn(
    room: string,
    x: number,
    y: number,
    name: string,
    shard: string
  ): Promise<GamePlaceSpawnResult> {
    return this.client
      .post("api/game/place-spawn", {
        json: {
          room,
          x,
          y,
          name,
          shard
        }
      })
      .json();
  }

  /**
   * 设置旗帜
   * @param room 房间名
   * @param x x 座标
   * @param y x 座标
   * @param name Spawn 名
   * @param color 主色编号
   * @param secondaryColor 次色编号
   * @param shard Shard 名
   * @return 设置旗帜响应
   */
  public async gameCreateFlag(
    room: string,
    x: number,
    y: number,
    name: string,
    color: number,
    secondaryColor: number,
    shard: string
  ): Promise<GameCreateFlagResult> {
    return this.client
      .post("api/game/create-flag", {
        json: {
          room,
          x,
          y,
          name,
          color,
          secondaryColor,
          shard
        }
      })
      .json();
  }

  /**
   * 生成唯一旗帜名
   * @param shard Shard 名
   * @return 生成唯一旗帜名响应
   */
  public async gameGenUniqueFlagName(shard: string): Promise<GameGenUniqueFlagNameResult> {
    return this.client
      .post("api/game/gen-unique-flag-name", {
        json: {
          shard
        }
      })
      .json();
  }

  /**
   * 检查唯一旗帜名
   * @param name 旗帜名
   * @param shard Shard 名
   * @return 检查唯一旗帜名响应
   */
  public async gameCheckUniqueFlagName(name: string, shard: string): Promise<GameCheckUniqueFlagNameResult> {
    return this.client
      .post("api/game/check-unique-flag-name", {
        json: {
          name,
          shard
        }
      })
      .json();
  }

  /**
   * 修改旗帜颜色
   * @param room 房间名
   * @param name Spawn 名
   * @param color 主色编号
   * @param secondaryColor 次色编号
   * @param shard Shard 名
   * @return 修改旗帜颜色响应
   */
  public async gameChangeFlagColor(
    room: string,
    name: string,
    color: number,
    secondaryColor: number,
    shard: string
  ): Promise<GameChangeFlagColorResult> {
    return this.client
      .post("api/game/change-flag-color", {
        json: {
          room,
          name,
          color,
          secondaryColor,
          shard
        }
      })
      .json();
  }

  /**
   * 删除旗帜
   * @param room 房间名
   * @param name Spawn 名
   * @param shard Shard 名
   * @return 删除旗帜响应
   */
  public async gameRemoveFlag(room: string, name: string, shard: string): Promise<GameRemoveFlagResult> {
    return this.client
      .post("api/game/remove-flag", {
        json: {
          room,
          name,
          shard
        }
      })
      .json();
  }

  /**
   * 添加对象意图
   * @param _id 对象 id
   * @param room 房间名
   * @param name 意图名
   * @param intent 意图参数
   * @param shard Shard 名
   * @return 添加对象意图响应
   */
  public async gameAddObjectIntent(
    _id: string,
    room: string,
    name: string,
    intent: string,
    shard: string
  ): Promise<GameAddObjectIntentResult> {
    return this.client
      .post("api/game/add-object-intent", {
        json: {
          _id,
          room,
          name,
          intent,
          shard
        }
      })
      .json();
  }

  /**
   * 创建建筑工地
   * @param room 房间名
   * @param x x 座标
   * @param y y 座标
   * @param structureType 房间名
   * @param name 旗帜名
   * @param shard Shard 名
   * @return 创建建筑工地响应
   */
  public async gameCreateConstruction(
    room: string,
    x: number,
    y: number,
    structureType: string,
    name: string,
    shard: string
  ): Promise<GameCreateConstructionResult> {
    return this.client
      .post("api/game/create-construction", {
        json: {
          room,
          x,
          y,
          structureType,
          name,
          shard
        }
      })
      .json();
  }

  /**
   * 设置建筑受攻击时提醒
   * @param _id 建筑 id
   * @param enabled 是否启用
   * @param shard Shard 名
   * @return 设置建筑受攻击时提醒响应
   */
  public async gameSetNotifyWhenAttacked(
    _id: string,
    enabled: boolean,
    shard: string
  ): Promise<GameSetNotifyWhenAttackedResult> {
    return this.client
      .post("api/game/set-notify-when-attacked", {
        json: {
          _id,
          enabled,
          shard
        }
      })
      .json();
  }

  /**
   * 创建敌人
   * @param room 房间名
   * @param x x 座标
   * @param y y 座标
   * @param size 敌人尺寸
   * @param type 敌人类型
   * @param boosted 是否强化
   * @param shard Shard 名
   * @return 创建敌人响应
   */
  public async gameCreateInvader(
    room: string,
    x: number,
    y: number,
    size: string,
    type: string,
    boosted: boolean,
    shard: string
  ): Promise<GameCreateInvaderResult> {
    return this.client
      .post("api/game/create-invader", {
        json: {
          room,
          x,
          y,
          size,
          type,
          boosted,
          shard
        }
      })
      .json();
  }
  /**
   * 删除敌人
   * @param _id 敌人 id
   * @param shard Shard 名
   * @return 删除敌人响应
   */
  public async gameRemoveInvader(_id: string, shard: string): Promise<GameRemoveInvaderResult> {
    return this.client
      .post("api/game/remove-invader", {
        json: {
          _id,
          shard
        }
      })
      .json();
  }

  /**
   * 获取时间
   * @param shard Shard 名
   * @return 获取时间响应
   */
  public async gameTime(shard: string): Promise<GameTimeResult> {
    return this.client
      .get("api/game/time", {
        searchParams: {
          shard
        }
      })
      .json();
  }

  /**
   * 获取世界尺寸
   * @param shard Shard 名
   * @return 获取世界尺寸响应
   */
  public async gameWorldSize(shard: string): Promise<GameWorldSizeResult> {
    return this.client
      .get("api/game/world-size", {
        searchParams: {
          shard
        }
      })
      .json();
  }

  /**
   * 获取房间装饰
   * @param room 房间名
   * @param shard Shard 名
   * @return 获取房间装饰响应
   */
  public async gameRoomDecorations(room: string, shard: string): Promise<GameRoomDecorationsResult> {
    return this.client
      .get("api/game/room-decorations", {
        searchParams: {
          room,
          shard
        }
      })
      .json();
  }

  /**
   * 获取房间对象
   * @param room 房间名
   * @param shard Shard 名
   * @return 获取房间对象响应
   */
  public async gameRoomObjects(room: string, shard: string): Promise<GameRoomObjectsResult> {
    return this.client
      .get("api/game/room-objects", {
        searchParams: {
          room,
          shard
        }
      })
      .json();
  }

  /**
   * 获取房间地形
   * @param room 房间名
   * @param shard Shard 名
   * @return 获取房间地形响应
   */
  public async gameRoomTerrain(room: string, shard: string): Promise<GameRoomTerrain> {
    return this.client
      .get("api/game/room-terrain", {
        searchParams: {
          room,
          shard
        }
      })
      .json();
  }

  /**
   * 获取房间状态
   * @param room 房间名
   * @param shard Shard 名
   * @return 获获取房间状态响应
   */
  public async gameRoomStatus(room: string, shard: string): Promise<GameRoomStatus> {
    return this.client
      .get("api/game/room-status", {
        searchParams: {
          room,
          shard
        }
      })
      .json();
  }

  /**
   * 获取房间概览
   * @param room 房间名
   * @param shard Shard 名
   * @return 获取房间概览响应
   */
  public async gameRoomOverview(room: string, shard: string): Promise<GameRoomOverview> {
    return this.client
      .get("api/game/room-overview", {
        searchParams: {
          room,
          shard
        }
      })
      .json();
  }
  // region Market
  /**
   * 获取订单索引
   * @param shard Shard 名
   * @return 获取订单索引响应
   */
  public async gameMarketOrdersIndex(shard: string): Promise<GameMarketOrdersIndexResult> {
    return this.client
      .get("api/game/market/orders-index", {
        searchParams: {
          shard
        }
      })
      .json();
  }

  /**
   * 获取用户订单
   * @param shard Shard 名
   * @return 获取用户订单响应
   */
  public async gameMarketMyOrders(shard: string): Promise<GameMarketMyOrdersResult> {
    return this.client
      .get("api/game/market/my-orders", {
        searchParams: {
          shard
        }
      })
      .json();
  }

  /**
   * 按资源获取订单
   * @param resourceType 资源类型
   * @param shard Shard 名
   * @return 按资源获取订单响应
   */
  public async gameMarketOrders(resourceType: string, shard: string): Promise<GameMarketOrdersResult> {
    return this.client
      .get("api/game/market/orders", {
        searchParams: {
          resourceType,
          shard
        }
      })
      .json();
  }

  /**
   * 按资源获取订单订单状态
   * @param resourceType 资源类型
   * @param shard Shard 名
   * @return 按资源获取订单订单状态响应
   */
  public async gameMarketStats(resourceType: string, shard: string): Promise<GameMarketStatsResult> {
    return this.client
      .get("api/game/market/stats", {
        searchParams: {
          resourceType,
          shard
        }
      })
      .json();
  }
  // endregion
  /**
   * 获取 Shard 状态
   * @return 获取 Shard 状态响应
   */
  public async gameShardsInfo(): Promise<GameShardsInfoMockResult> {
    return this.client.get("api/game/shards/info").json();
  }

  /**
   * 获取 Shard Tick 时间
   * @param shard Shard 名
   * @return 获取 Shard Tick 时间响应
   */
  public async gameShardsTick(shard: string): Promise<GameShardsTickResult> {
    return this.client
      .get("api/game/shards/tick", {
        searchParams: {
          shard
        }
      })
      .json();
  }
  // endregion

  // region Experimental
  /**
   * 获取 Pvp 记录
   * @param interval 间隔
   * @return 获取 Pvp 记录响应
   */
  public async experimentalPvp(interval: number): Promise<ExperimentalPvpResult> {
    return this.client
      .get("api/experimental/pvp", {
        searchParams: {
          interval
        }
      })
      .json();
  }

  /**
   * 获取核弹记录
   * @return 获取核弹记录响应
   */
  public async experimentalNuke(): Promise<ExperimentalNukeResult> {
    return this.client.get("api/experimental/nukes").json();
  }
  // endregion
}
