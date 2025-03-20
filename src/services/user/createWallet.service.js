import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    currencyId: { type: 'string' },
    isDefault: { type: 'string' }
  },
  required: ['userId', 'currencyId']
})

export class CreateWalletService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const wallet = await this.context.sequelize.models.wallet.create({
        userId: this.args.userId,
        currencyId: this.args.currencyId,
        isDefault: this.args.isDefault
      }, {
        transaction: this.context.sequelizeTransaction
      })

      return wallet
    } catch (error) {
      throw new APIError(error)
    }
  }
}
