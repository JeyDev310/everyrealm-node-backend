import { Emitter } from '@socket.io/redis-emitter'
import Redis from '@src/libs/redisClient'

export const socketEmitter = new Emitter(Redis.publisherClient)
