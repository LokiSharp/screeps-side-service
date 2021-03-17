import { RawApi } from "@/api/RawApi";

/**
 * ScreepsApi 类
 */
export class ScreepsApi extends RawApi {
  private _user: Partial<User> | undefined = undefined;
  private _tokenInfo: Partial<Token> | undefined = undefined;
  private opts: ScreepsApiOptions = {};

  /**
   * 查询用户自身用户
   * @return 用户
   */
  public async me(): Promise<Partial<User>> {
    if (this._user) return this._user;
    const tokenInfo = await this.tokenInfo();
    if (tokenInfo.full) {
      this._user = await this.authMe();
    } else {
      const { username } = await this.userName();
      const { user } = await this.userFind(username);
      this._user = user;
    }
    return this._user;
  }

  /**
   * 查询用户自身用户
   * @return 用户
   */
  public async tokenInfo(): Promise<Partial<Token>> {
    if (this._tokenInfo) return this._tokenInfo;
    if (this.opts.token) {
      const { token } = await this.authQueryToken(this.opts.token);
      this._tokenInfo = token;
    } else {
      this._tokenInfo = { full: true };
    }
    return this._tokenInfo;
  }

  /**
   * 查询用户自身用户 id
   * @return 用户 id
   */
  public async userId(): Promise<string | undefined> {
    const user = await this.me();
    return user._id;
  }
}
