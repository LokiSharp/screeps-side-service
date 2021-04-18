import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("hello-world")
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("get-cross-shard")
  async getCrossShard(
    @Query("startShard") startShard: string,
    @Query("startRoom") startRoom: string,
    @Query("endShard") endShard: string,
    @Query("endRoom") endRoom: string
  ): Promise<{ path: string[]; distance: number; totalRooms: number }> {
    return this.appService.getCrossShard(startShard, startRoom, endShard, endRoom);
  }
}
