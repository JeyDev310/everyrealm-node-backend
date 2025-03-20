import { NAMESPACES, ROOMS } from '@src/utils/constants/socket.constants'

/**
 * @param {import('socket.io').Server} io
 */
export default function (io) {
  const namespace = io.of(NAMESPACES.PUBLIC)
  namespace.on('connection', (socket) => {
    socket.join(ROOMS.PUBLIC.RELOAD_HISTORY)
    socket.join(ROOMS.PUBLIC.PRE_MATCH)
    socket.join(ROOMS.PUBLIC.IN_PLAY)
    socket.join(ROOMS.PUBLIC.ORDER_BOOK)
  })
}
