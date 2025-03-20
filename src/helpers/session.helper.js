import { sequelize } from '@src/database'
import { Cache, CacheStore } from '@src/libs/cache'
import redisClient from '@src/libs/redisClient'
import { CACHE_KEYS, CACHE_STORE_PREFIXES } from '@src/utils/constants/app.constants'
import _ from 'lodash'

/**
 * @param {string} userId
 */
async function destroyOldSessions (userId) {
  const keys = await redisClient.client.keys(`${CACHE_STORE_PREFIXES.SESSION}*:${userId}`)
  if (keys.length) await redisClient.client.del(keys)
}

/**
 * @param {string} key
 */
export async function destroySessionsFromExpiredKeyEvent (key) {
  if (!key.includes(CACHE_STORE_PREFIXES.SESSION)) return false
  const [, , userId] = key.split(':')
  if (!userId) return false

  // await sequelize.models.user.update({ loggedIn: false }, { where: { id: userId } })
}

/**
 * @param {import('express').Request} req
 * @param {string} userId
 * @returns {string} Session ID
 */
export async function createSession (req, uniqueId, sessionLimit = null) {
  // Appending user id in session id, so when we get expired key event in redis, we'll get the user id as well.
  // Adding user id in the session id does not compromise any security.
  const sessionId = `${req.sessionID}:${uniqueId}`
  if (sessionLimit) req.session.cookie.maxAge = sessionLimit

  // Destroy all old sessions first to avoid current session checking in cache
  await destroyOldSessions(uniqueId)

  // Generate new session
  req.sessionStore.set(sessionId, { cookie: req.session.cookie, uniqueId })
  // res.cookie(COOKIE_KEYS.ACCESS_TOKEN, req.sessionID, req.session.cookie)
  return sessionId
}

/**
 * @param {import('express').Request} req
 */
export function destroySession (req) {
  req.sessionStore.destroy(req.sessionID)
}

/**
 * Session case: When x number of users are logged in, database logged in entry is true and session expiery time is set
 * If the service breakdown for some unknown reason, readis keys will be expired as soon as they hit their expiery time.
 * But the database entry will not change, and this will cause many problems in the whole system.
 * So, in order to prevent this situation we need 2 functions (Functions are described below)
 *
 * First funtion - in case of system failure it will create map all of all the active sessions and store it in the redis cache
 * Second function - when the service backs up again, this function will get the map from the cache,
 *                    and if the session id stored in the map does not exists in the redis memory then
 *                    it will update the database entry logged in as false.
 */
export async function createFallbackSessionMap () {
  const keys = await redisClient.client.keys(`${CACHE_STORE_PREFIXES.SESSION}*`)
  if (keys.length) await Cache.set(CacheStore.redis, CACHE_KEYS.USER_BACKEND_SESSION_MAP, keys)
}

export async function removeExpiredSessions () {
  /** @type {Array} */
  const keys = await Cache.get(CacheStore.redis, CACHE_KEYS.USER_BACKEND_SESSION_MAP)
  if (!keys) return true

  const aliveSessionKeys = await redisClient.client.keys(`${CACHE_STORE_PREFIXES.SESSION}*`)
  const expiredSessionKeys = _.difference(keys, aliveSessionKeys)

  await Promise.all(expiredSessionKeys.map(async key => {
    const [, , userId] = key.split(':')
    // await sequelize.models.user.update({ loggedIn: false }, { where: { id: userId } })
  }))
  await Cache.del(CacheStore.redis, CACHE_KEYS.USER_BACKEND_SESSION_MAP)
}
