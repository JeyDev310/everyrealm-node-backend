import Redis from "ioredis";
import { logger } from '@src/utils/logger'

const redisMeta = [];
let sharedPublisherClient = null;
let sharedSubscriberClient = null;

// Redis cluster options, configured for Bull queues
const clusterOptions = {
  clusterRetryStrategy: (times) => Math.min(100 + times * 50, 2000), // Exponential backoff
  enableReadyCheck: true,               // Required for Bull queues
  maxRetriesPerRequest: 3,            // Required for Bull queue
};

/**
 * @typedef {object} RedisConnections
 * @property {Redis.Cluster | Redis} client
 * @property {Redis.Cluster | Redis} publisherClient
 * @property {Redis.Cluster | Redis} subscriberClient
 * @property {string} name
 */

/**
 * Initializes a Redis cluster connection with optional pub/sub clients.
 * If the connection already exists, it returns the singleton instance.
 * @param {string} name
 * @param {import('ioredis').RedisOptions | string[]} connection
 * @param {boolean} includePubSub
 * @return {RedisConnections}
 */
function create(name = "redis-cluster", connection, includePubSub = false) {
  // Check for an existing connection by name
  let existingConnection = redisMeta.find((redis) => redis.name === name);
  if (existingConnection) {
    logger.info(`RedisFactory:  Reusing existing ${name} connection.`);
    return existingConnection;
  }

  const isCluster = false

  const redisConnections = {
    name,
    client: isCluster ? new Redis.Cluster([connection], clusterOptions) : new Redis(connection),
    publisherClient: null,
    subscriberClient: null,
  };

  redisConnections.client.on("connect", () => logger.info(`RedisFactory: ${redisConnections.name} connected...`));
  redisConnections.client.on("close", () => logger.info(`RedisFactory: ${redisConnections.name} closed...`));
  redisConnections.client.on("end", () => logger.info(`RedisFactory: ${redisConnections.name} End...`));

  // Use singleton pub/sub clients if required, with cluster compatibility and Bull queue settings
  if (includePubSub) {
    if (!sharedPublisherClient) {
      sharedPublisherClient = isCluster
        ? new Redis.Cluster([connection], clusterOptions)
        : new Redis(connection);
        sharedPublisherClient.on("error", (err) => logger.error("Publisher client error:", { message: err.message, stack: err.stack }));
    }
    if (!sharedSubscriberClient) {
      sharedSubscriberClient = isCluster
        ? new Redis.Cluster([connection], clusterOptions)
        : new Redis(connection);
      sharedSubscriberClient.on("error", (err) => logger.error("Subscriber client error:", { message: err.message, stack: err.stack }));
    }
    redisConnections.publisherClient = sharedPublisherClient;
    redisConnections.subscriberClient = sharedSubscriberClient;
  }

  // Store the connection in redisMeta for reuse
  redisMeta.push(redisConnections);
  return redisConnections;
}

/**
 * Subscribes to key expiration events on a dedicated node or pub/sub instance.
 * @param {Redis.Cluster | Redis} client
 * @param {Redis.Cluster | Redis} subscriberClient
 * @param {Function} callback
 */
function subscribeKeyEventExpired(client, subscriberClient, callback) {
  client.call("config", "set", "notify-keyspace-events", "Ex", (err) => {
    if (err) {
      logger.warn("Could not set notify-keyspace-events due to permissions:", err.message);
    }
  });

  subscriberClient.subscribe("__keyevent@0__:expired", (err, count) => {
    if (err) {
      logger.error("Failed to subscribe:", err);
    } else {
      logger.info(`Subscribed to ${count} channels.`);
    }
  });

  subscriberClient.on("message", (channel, message) => {
    if (channel === "__keyevent@0__:expired") {
      callback(message);
    }
  });

  subscriberClient.once("close", () => subscriberClient.off("message", callback));
}

/**
 * Closes a Redis cluster instance by name
 * @param {string} name
 */
function close(name) {
  const redis = redisMeta.find((redis) => redis.name === name);
  if (redis) {
    redis.client.disconnect();
    logger.info(`RedisFactory: ${redis.name} closed...`);
  }
}

/**
 * Closes all Redis instances
 */
function closeAll() {
  redisMeta.forEach((redis) => {
    redis.client.disconnect();
    logger.info(`RedisFactory: ${redis.name} closed...`);
  });
  if (sharedPublisherClient) sharedPublisherClient.disconnect();
  if (sharedSubscriberClient) sharedSubscriberClient.disconnect();
}

/**
 * Checks the health of all Redis instances
 */
async function checkAll() {
  await Promise.all(
    redisMeta.map(async (redis) => {
      try {
        const pong = await redis.client.ping();
        if (pong !== "PONG") {
          logger.info(`RedisFactory: Unhealthy ${redis.name} redis instance`);
        }
      } catch (error) {
        logger.error(`RedisFactory: Error checking health for ${redis.name}:`,  { message: error.message, stack: error.stack });
      }
    })
  );
}

export const redisFactory = {
  close,
  create,
  closeAll,
  checkAll,
  subscribeKeyEventExpired,
  redisConnections: redisMeta,
};
