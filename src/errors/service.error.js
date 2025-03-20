import { errorTypes } from '@src/utils/constants/error.constants'
import BaseError from './base.error'

export class ServiceError extends BaseError {
  constructor (errorMessage) {
    const serviceErrorType = errorTypes.serviceErrorType

    if (errorMessage instanceof ServiceError) errorMessage = errorMessage.description
    if (typeof errorMessage === 'string') serviceErrorType.isOperational = true

    serviceErrorType.description = errorMessage
    super(serviceErrorType)
  }
}
