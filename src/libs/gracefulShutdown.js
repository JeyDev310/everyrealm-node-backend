import { sequelize } from '@src/database'
import { createFallbackSessionMap } from '@src/helpers/session.helper'
import { redisFactory } from '@src/libs/factory/redis.factory'
import { logger } from '@src/utils/logger'

let signalReceived = false
async function gracefulShutdown (siganl) {
  try {
    if (signalReceived) return
    signalReceived = true
    logger.info('Shutdown', { message: `Received ${siganl}` })

    await createFallbackSessionMap()
    await redisFactory.closeAll()
    await sequelize.close()
    logger.error('Shutdown', { message: 'goodbye...' })
    process.exit(0)
  } catch (error) {
    logger.error('Shutdown', { message: 'failed, exiting manually...', exception: error })
    process.exit(1)
  }
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('SIGUSR2', gracefulShutdown)
