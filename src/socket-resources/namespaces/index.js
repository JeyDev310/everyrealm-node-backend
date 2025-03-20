import { newNamespaceRegistrationMiddleware } from '@src/socket-resources/middlewares/newNamespaceRegistration.middleware'
import privateNamespace from './private.namespace'
import publicNamespace from './public.namespace'

/**
 * @export
 * @param {import('socket.io').Socket} socket
 * @param {SocketSchemas} socketSchemas
 * @return {*}
 */
export function registerNamespaces (socket) {
  socket.on('new_namespace', (namespace) => {
    namespace.use(newNamespaceRegistrationMiddleware)
  })

  publicNamespace(socket)
  privateNamespace(socket)
}
