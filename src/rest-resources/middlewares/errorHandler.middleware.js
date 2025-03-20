import { errorTypes } from '@src/utils/constants/error.constants'
import { getLocalizedError, isTrustedError } from '@src/utils/error.utils'
import { StatusCodes } from 'http-status-codes'
import { logger } from '@src/utils/logger'

/**
 *
 * @memberof Rest Middleware
 * @export
 * @name errorHandlerMiddleware
 * @param {*} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 *
 */


export function errorHandlerMiddleware(err, req, res, next) {
  let errorsAreTrusted = true
  let responseStatusCode

  if (!(err instanceof Array)) {
    err = [err]
  }
  const localizedInternalServerErrorType = getLocalizedError(errorTypes.InternalServerErrorType, res.__)

  const responseErrors = err.map(error => {
    logger.error(
      (error.name || errorTypes.InternalServerErrorType.name) + `In ${req.path}`,
      {
        message: error.message || error.description || 'No message provided',
        context: {
          traceId: req?.context?.traceId,
          query: req.query,
          params: req.params,
          body: req.body
        },
        fault: error.fields
      })
    errorsAreTrusted = isTrustedError(error)

    responseStatusCode = error.statusCode

    const localizedError = getLocalizedError(error, res.__)

    return localizedError
  })

  if (errorsAreTrusted) {
    res.status(responseStatusCode || StatusCodes.BAD_REQUEST)
      .send({ data: {}, errors: responseErrors });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      data: {},
      errors: [{
        ...localizedInternalServerErrorType,
        traceId: req?.context?.traceId
      }]
    });
  }
  next()
}
