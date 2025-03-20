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

export class GetWalletsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const wallets = await this.context.sequelize.models.wallet.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        where: { userId: this.args.userId },
        include: {
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          model: this.context.sequelize.models.currency,
          required: true,
          where: { isActive: true }
        }
      })
      return { wallets }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
