interface Portal {
  id: string;
  shard: string;
  room: string;
  x: number;
  y: number;
  disabled?: boolean;
  destination?: {
    shard?: string;
    room?: string;
    x?: number;
    y?: number;
  };
}
