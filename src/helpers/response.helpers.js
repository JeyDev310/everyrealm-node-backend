import BaseError from '@src/errors/base.error'
import RequestInputValidationError from '@src/errors/requestInputValidation.error'
import { errorTypes } from '@src/utils/constants/error.constants'
import { extractErrorAttributes } from '@src/utils/error.utils'
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
export const decorateResponse = ({ req, res, next }, { success, result, errors }) => {
  if (success) {
    res.payload = { data: result, errors: [] }
    next()
  } else {
    if (!_.isEmpty(errors)) {
      const errorValues = _.values(errors)
      if (_.has(errorValues[0], 'validationErrors')) {
        next(new RequestInputValidationError(_.get(errorValues[0], 'validationErrors')))
      } else {
        next(extractErrorAttributes(errors).map(errorAttr => errorTypes[errorAttr] || errorAttr))
      }
    }
    next(errors)
  }
}

export const sendSocketResponse = ({ reqData, resCallback }, { successful, result, serviceErrors, defaultError }) => {
  if (successful && !_.isEmpty(result)) {
    return resCallback({ data: result, errors: [] })
  } else {
    if (!_.isEmpty(serviceErrors)) {
      // executed when addError is called from service
      const responseErrors = extractErrorAttributes(serviceErrors).map(errorAttr => errorTypes[errorAttr] || errorAttr)
      return resCallback({ data: {}, errors: responseErrors })
    }
    const responseError = new BaseError({ ...defaultError })
    return resCallback({ data: {}, errors: [responseError] })
  }
}
