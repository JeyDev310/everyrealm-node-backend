import { socketEmitter } from '@src/libs/socketEmitter'
import { EVENTS, NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'

/**
 * @param {string | number} userId
 * @param {object} payload
 */
export function emitBetLimit (userId, payload) {
  socketEmitter.of(NAMESPACES.PRIVATE).to(`${ROOMS.PRIVATE.BET_LIMIT}:${userId}`).emit(EVENTS.BET_LIMIT, payload)
  return true
}
