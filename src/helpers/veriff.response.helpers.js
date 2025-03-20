import { StatusCodes } from 'http-status-codes'
import _ from 'lodash'

/**
 * @param {{
 *  req: import('express').Request,
 *  res: import('express').Response,
 *  next: import('express').NextFunction
 * }} param0
 * @param {import('@src/libs/serviceBase').default} param1
 * @returns {void}
 */
export const veriffResponseDecorator = ({ req, res, next }, { success, result, errors }, tournament = false) => {
  if (success && !_.isEmpty(result)) {
    res.payload = result
  }
  res.status(result.statusCode || StatusCodes.OK).json(res.payload)
}
