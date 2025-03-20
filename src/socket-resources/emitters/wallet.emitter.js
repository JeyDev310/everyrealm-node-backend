import { socketEmitter } from '@src/libs/socketEmitter'
import { EVENTS, NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'
import { logger } from "@src/utils/logger"

/**
 * @param {string | number} userId
 * @param {object} payload
 */
export function emitUserWallet (userId, payload) {
  logger.info('Start(emitUserWallet):', `${ROOMS.PRIVATE.WALLET}:${userId}`);
  socketEmitter.of(NAMESPACES.PRIVATE).to(`${ROOMS.PRIVATE.WALLET}:${userId}`).emit(EVENTS.WALLET, payload)
  return true
}
