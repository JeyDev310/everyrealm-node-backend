
import { errorTypes } from '@src/utils/constants/error.constants'
import { NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'
import { sequelize } from '@src/database'
import { privy } from '@src/libs/privyClient'
import { logger } from "@src/utils/logger"

/**
 * @param {import('socket.io').Server} io
 */
export default function (io) {
  const namespace = io.of(NAMESPACES.PRIVATE)

  namespace.use(async (socket, next) => {
    try {
      const accessToken = socket.handshake?.query?.['access-token']

      if (!accessToken) return next(errorTypes.AccessTokenNotFoundErrorType)

      // const session = JSON.parse(await redisClient.client.get(`${CACHE_STORE_PREFIXES.SESSION}${accessToken}`))

      let verifiedClaims = null;
      try {
        verifiedClaims = await privy.verifyAuthToken(accessToken.replaceAll('"', ''));
        // logger.info('verifiedClaims:------> ', {verifiedClaims})
      } catch (error) {
        logger.error(error)
        return next(errorTypes.SessionExpiredErrorType)
      }
      // if (!session) return next(errorTypes.SessionExpiredErrorType)

        const user = await sequelize.models.user.findOne({
          attributes: ['id'],
          where: { privyId: verifiedClaims?.userId }
        })
      socket.operator = {
        userId: user.id
      }
      next()
    } catch (error) {
      next(error)
    }
  })
  namespace.on('connection', (socket) => {
    socket.join(`${ROOMS.PRIVATE.BET}:${socket.operator.userId}`)
    socket.join(`${ROOMS.PRIVATE.WALLET}:${socket.operator.userId}`)
    socket.join(`${ROOMS.PRIVATE.LOGOUT}:${socket.operator.userId}`)
    socket.join(`${ROOMS.PRIVATE.EXCHANGE_BET}:${socket.operator.userId}`)
    socket.join(`${ROOMS.PRIVATE.DEPOSIT}:${socket.operator.userId}`)
    socket.join(`${ROOMS.PRIVATE.WITHDRAW}:${socket.operator.userId}`)
    socket.join(`${ROOMS.PRIVATE.BET_LIMIT}:${socket.operator.userId}`)
    socket.join(`${ROOMS.PRIVATE.EXCHANGE_RATE}`)
  })
}
