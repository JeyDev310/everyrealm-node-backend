import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class GetAddressesService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const addresses = await this.context.sequelize.models.address.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        where: { userId: this.args.userId }
      })
      return { addresses }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
