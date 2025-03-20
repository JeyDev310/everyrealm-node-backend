import { socketEmitter } from '@src/libs/socketEmitter'
import { EVENTS, NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'
import { logger } from "@src/utils/logger"

/**
 * @param {string | number} userId
 * @param {object} payload
 */
export function emitUserWithdraw (userId, payload) {
  logger.info('Start(emitUserWithdraw):', `${ROOMS.PRIVATE.WITHDRAW}:${userId}`);
  socketEmitter.of(NAMESPACES.PRIVATE).to(`${ROOMS.PRIVATE.WITHDRAW}:${userId}`).emit(EVENTS.WITHDRAW, payload)
  return true
}
