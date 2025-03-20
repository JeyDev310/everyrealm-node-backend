import { i18n } from '@src/libs/i18n'
import { errorTypes } from '@src/utils/constants/error.constants'
import { getLocalizedError, isTrustedError } from '@src/utils/error.utils'
import { argumentsDecoratorMiddleware } from './argumentsDecorator.middleware'
import { contextMiddleware } from './context.middleware'
import { requestValidationMiddleware } from './requestValidation.middleware'
import { logger } from "@src/utils/logger"

/**
 * @param {import('socket.io').Socket} socket
 * @param {Function} next
 * @returns {void}
 */
export function newNamespaceRegistrationMiddleware (socket, next) {
  i18n.init(socket.request)
  socket.on('error', (error) => {
    if (isTrustedError(error)) {
      socket.emit('error', { data: {}, errors: [getLocalizedError(error, socket.request.__)] })
    } else {
      logger.error(error.name || errorTypes.InternalServerErrorType.name, {
        message: error.message || error.description,
        fault: error.fields
      })
      socket.emit('error', { data: {}, errors: [getLocalizedError(errorTypes.InternalServerErrorType, socket.request.__)] })
    }
  })

  socket.use(argumentsDecoratorMiddleware(socket))
  socket.use(contextMiddleware(socket))
  socket.use(requestValidationMiddleware(socket))

  next()
}
