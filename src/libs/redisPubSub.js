import { redisOptions } from "@src/configs";
import { redisFactory } from "@src/libs/factory/redis.factory";

const connection = {
  ...redisOptions.pubSubRedisOptions,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const { name, client, publisherClient, subscriberClient } =
  redisFactory.create("redis-client", connection, true);
