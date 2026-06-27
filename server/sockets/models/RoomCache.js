import Redis from "ioredis";

export class CacheService {
  constructor() {
    this.redis = new Redis();
  }

  async set(key, value) {
    await this.redis.set(key, JSON.stringify(value));
  }

  async get(key) {
    const data = await this.redis.get(key);
    if(!data) return
    return JSON.parse(data);
  }
}
// import {RoomCache} from './RoomCache.js'
// const room = new RoomCache();
// room.set("user:1",{id:1,name:"John" })