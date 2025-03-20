import { socketEmitter } from '@src/libs/socketEmitter'
import { EVENTS, NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'
import { logger } from "@src/utils/logger"

/**
 * @param {string | number} userId
 * @param {object} payload
 */
export function emitUserDeposit (userId, payload) {
  logger.info('Start(emitUserDeposit):', `${ROOMS.PRIVATE.DEPOSIT}:${userId}`);
  socketEmitter.of(NAMESPACES.PRIVATE).to(`${ROOMS.PRIVATE.DEPOSIT}:${userId}`).emit(EVENTS.DEPOSIT, payload)
  return true
}
