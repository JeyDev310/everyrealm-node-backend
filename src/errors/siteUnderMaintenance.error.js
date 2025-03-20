import { errorTypes } from '@src/utils/constants/error.constants'
import BaseError from './base.error'

export default class SiteUnderMaintenanceError extends BaseError {
  constructor (fields = {}) {
    super(errorTypes.SiteUnderMaintenanceErrorType)
    this.fields = fields
  }
}
