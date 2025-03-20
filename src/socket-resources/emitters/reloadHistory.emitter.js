import { socketEmitter } from '@src/libs/socketEmitter'
import { EVENTS, NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'

/**
 * @param {string | number} userId
 * @param {object} payload
 */
export function emitReloadHistory (payload) {
socketEmitter.of(NAMESPACES.PUBLIC).to(`${ROOMS.PUBLIC.RELOAD_HISTORY}`).emit(EVENTS.RELOAD_HISTORY, payload);

return true;
}
