import { errorTypes } from '@src/utils/constants/error.constants'
import BaseError from './base.error'

export default class InvalidSocketArgumentError extends BaseError {
  constructor (fields = {}) {
    super(errorTypes.InvalidSocketArgumentErrorType)
    this.fields = fields
  }
}
