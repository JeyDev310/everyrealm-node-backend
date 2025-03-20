import { config } from './config'

/** @type {import('ioredis').RedisOptions} */
export const pubSubRedisOptions = {
  host: config.get('pub_sub_redis_db.host'),
  port: config.get('pub_sub_redis_db.port'),
  password: config.get('pub_sub_redis_db.password')
}
