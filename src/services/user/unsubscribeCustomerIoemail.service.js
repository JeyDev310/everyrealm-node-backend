import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { APIError } from '@src/errors/api.error'
import { insertUpdate } from '@src/libs/customerio/customerio'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class UnsubscribeCustomerIoEmailService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const userId = this.args.userId
      await insertUpdate(userId, { unsubscribed: true })
      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
