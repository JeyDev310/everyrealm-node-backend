import { sequelize } from '@src/database'
import { redisFactory } from '@src/libs/factory/redis.factory'
import { logger } from '@src/utils/logger'

/**
 * @param {import('express').Request} _
 * @param {import('express').Response} res
 * @returns {void}
 */
export async function healthCheck (_, res) {
  const healthCheck = {
    message: 'OK',
    healthy: true,
    timestamp: Date.now(),
    uptime: process.uptime()
  }

  try {
    await sequelize.authenticate()
  } catch (error) {
    healthCheck.healthy = false
    logger.error('HealthCheck', { message: 'Unhealthy database', exception: error })
  }

  try {
    await redisFactory.checkAll()
  } catch (error) {
    healthCheck.healthy = false
    logger.error('HealthCheck', { message: 'Unhealthy redis instances', exception: error })
  }

  if (healthCheck.healthy) res.status(200).json(healthCheck)
  else res.status(503).send('Health check failed')
}
