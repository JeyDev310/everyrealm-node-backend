import { errorTypes } from '@src/utils/constants/error.constants'
import BaseError from './base.error'

export default class RequestInputValidationError extends BaseError {
  constructor (fields = {}) {
    super(errorTypes.RequestInputValidationErrorType)
    this.fields = fields
  }
}
