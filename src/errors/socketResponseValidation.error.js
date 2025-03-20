import { errorTypes } from '@src/utils/constants/error.constants'
import BaseError from './base.error'

export default class SocketResponseValidationError extends BaseError {
  constructor (fields = {}) {
    super(errorTypes.SocketResponseValidationErrorType)
    this.fields = fields
  }
}
