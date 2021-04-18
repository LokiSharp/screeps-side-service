import { Injectable } from "@nestjs/common";
import { CrossShard } from "@/tools/crossShard";

const crossShard = new CrossShard();

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }

  async getCrossShard(
    startShard: string,
    startRoom: string,
    endShard: string,
    endRoom: string
  ): Promise<{ path: string[]; distance: number; totalRooms: number }> {
    await crossShard.buildPortals("shard0");
    await crossShard.buildPortals("shard1");
    await crossShard.buildPortals("shard2");
    await crossShard.buildPortals("shard3");

    crossShard.clacCrossShardPortalDistance("shard0", "shard1");
    crossShard.clacCrossShardPortalDistance("shard1", "shard2");
    crossShard.clacCrossShardPortalDistance("shard2", "shard3");

    crossShard.addRoomPosObject({
      shard: startShard,
      room: startRoom,
      x: 25,
      y: 25,
      destination: { room: startRoom }
    } as Portal);

    crossShard.addRoomPosObject({
      shard: endShard,
      room: endRoom,
      x: 25,
      y: 25,
      destination: { room: endRoom }
    } as Portal);

    crossShard.clacInnerShardPortalDistance("shard0");
    crossShard.clacInnerShardPortalDistance("shard1");
    crossShard.clacInnerShardPortalDistance("shard2");
    crossShard.clacInnerShardPortalDistance("shard3");

    const startRoomName = `${startShard}_${startRoom}_25_25`;
    const endRoomName = `${endShard}_${endRoom}_25_25`;

    return crossShard.dijkstra(startRoomName, endRoomName);
  }
}
