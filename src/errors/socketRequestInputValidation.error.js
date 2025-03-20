import { errorTypes } from '@src/utils/constants/error.constants'
import BaseError from './base.error'

export default class SocketRequestInputValidationError extends BaseError {
  constructor (fields = {}) {
    super(errorTypes.SocketRequestInputValidationErrorType)
    this.fields = fields
  }
}
