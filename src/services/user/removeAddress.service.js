import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    addressId: { type: 'string' }
  },
  required: ['userId', 'addressId']
})

export class RemoveAddressService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const address = await this.context.sequelize.models.address.findOne({
        where: {
          id: this.args.addressId,
          userId: this.args.userId
        }
      })

      if (!address) return this.addError('InvalidAddressIdErrorType')
      await address.destroy()

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
