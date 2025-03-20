import { errorTypes } from '@src/utils/constants/error.constants'
import BaseError from './base.error'

export class APIError extends BaseError {
  constructor (errorObject) {
    super({ ...errorTypes.InternalServerErrorType, description: errorObject })
  }
}
