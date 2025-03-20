import { socketEmitter } from '@src/libs/socketEmitter'
import { EVENTS, NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'

/**
 * @param {string | number} userId
 * @param {object} payload
 */
export function emitUserBet (userId, payload) {
  socketEmitter.of(NAMESPACES.PRIVATE).to(`${ROOMS.PRIVATE.BET}:${userId}`).emit(EVENTS.BET, payload)
  return true
}

/**
 * @param {string | number} userId
 * @param {object} payload
 */
export function emitUserExchangeBet (userId, payload) {
  socketEmitter.of(NAMESPACES.PRIVATE).to(`${ROOMS.PRIVATE.EXCHANGE_BET}:${userId}`).emit(EVENTS.EXCHANGE_BET, payload)
  return true
}
