import InvalidSocketArgumentError from '@src/errors/InvalidSocketArgument.error'
import { getLocalizedError } from '@src/utils/error.utils'

/**
 * @param {import('socket.io').Socket} socket
 * @return {function(args: Array, next: Fucntion): void}
 * It will make sure that whenever we receive data it will be in proper format
 * like eventName, [payload] and [callback]
 * If the args is not in proper order then it will raise error, it will always expect the event to be on first place
 * and no more than 3 arguments
 */
export function argumentsDecoratorMiddleware (socket) {
  return (args, next) => {
    if (args.length !== 3 || (args[2] && typeof args[2] !== 'function')) {
      const invalidPayloadError = new InvalidSocketArgumentError({ payload: args })

      if (typeof args[args.length - 1] === 'function') {
        const localizedError = getLocalizedError(invalidPayloadError, socket.request.__)
        args[args.length - 1]({ data: {}, errors: [localizedError] })
      }

      next(invalidPayloadError)
    } else {
      next()
    }
  }
}
