import SocketRequestInputValidationError from '@src/errors/socketRequestInputValidation.error'
import ajv from '@src/libs/ajv'
import { getLocalizedError } from '@src/utils/error.utils'
import localize from 'ajv-i18n'
import { logger } from "@src/utils/logger"

/**
 * @param {import('socket.io').Socket} socket
 * @returns {function([string, import('./context.middleware').SocketRequestData, function],function): void}
 * If schema is there it will get the schema and validate the if data is not valid it will pass the error
 * to the client if resCallback is available and pass the error to the next middleware
 */
export function requestValidationMiddleware (socket) {
  return function (args, next) {
    const [eventName, requestData, resCallback] = args
    const { payload, context } = requestData

    const compiledPayloadSchema = context?.schemas?.request
    if (!compiledPayloadSchema) {
      next()
    } else if (!compiledPayloadSchema(payload)) {
      const locale = socket.request.locale.split('-')[0]

      localize[locale](compiledPayloadSchema.errors)

      const errors = ajv.errorsText(compiledPayloadSchema.errors, { separator: ' ||||| ' }).split(' ||||| ')
      const validationError = new SocketRequestInputValidationError(errors)

      logger.error('SocketRequestInputValidationError' + ` In namespace ${socket.nsp.name} event name ${eventName}`, {
        message: validationError.message,
        fault: validationError.fields
      })

      resCallback({ errors: [getLocalizedError(validationError, socket.request.__)], data: {} })
      next(validationError)
    } else {
      next()
    }
  }
}
