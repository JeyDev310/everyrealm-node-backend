import { redisOptions } from '@src/configs'
import { destroySessionsFromExpiredKeyEvent } from '@src/helpers/session.helper'
import { redisFactory } from '@src/libs/factory/redis.factory'

const connection = {
  ...redisOptions.pubSubRedisOptions,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
}

const {
  name,
  client,
  publisherClient,
  subscriberClient
} = redisFactory.create('redis-client', connection, true)

redisFactory.subscribeKeyEventExpired(client, subscriberClient, destroySessionsFromExpiredKeyEvent)

export default {
  name,
  client,
  publisherClient,
  subscriberClient
}
