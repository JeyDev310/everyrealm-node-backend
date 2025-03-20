import Redis from '@src/libs/redisClient'
import { CACHE_STORE_PREFIXES } from '@src/utils/constants/app.constants'
import NodeCache from 'node-cache'

export class CacheStore {
  static redis = Redis.client
  static local = new NodeCache()
}

export class Cache {
  static #cachePrefix = CACHE_STORE_PREFIXES.BACKEND_CACHE
  static #getKey = (key) => `${this.#cachePrefix}${key}`

  /**
   * @param {NodeCache | import('ioredis')} store
   * @param {string} key
   * @param {string} value
   * @returns
   */
  static async set (store, key, value) {
    return store.set(this.#getKey(key), JSON.stringify(value))
  }

  /**
   * @param {NodeCache | import('ioredis')} store
   * @param {string} key
   * @returns
   */
  static async get (store, key) {
    const data = await store.get(this.#getKey(key))
    return JSON.parse(data)
  }

  /**
   * @param {NodeCache | import('ioredis')} store
   * @param {string} key
   * @returns
   */
  static del (store, key) {
    return store.del(this.#getKey(key))
  }

  /**
   * @param {NodeCache | import('ioredis')} store
   * @returns
   */
  static async keys (store) {
    const keys = await store.keys(`${this.#cachePrefix}*`)
    return keys
  }
}
