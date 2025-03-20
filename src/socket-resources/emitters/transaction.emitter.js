import { socketEmitter } from '@src/libs/socketEmitter'
import { NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'

/**
 * @param {object} tx
 */
export function emitCasinoTransaction (tx) {
  socketEmitter.of(NAMESPACES.INTERNAL).to(ROOMS.INTERNAL.CASINO_TRANSACTION).emit(ROOMS.INTERNAL.CASINO_TRANSACTION, tx)
  return true
}
