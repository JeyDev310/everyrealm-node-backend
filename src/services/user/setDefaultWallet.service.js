import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { Op } from 'sequelize'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    walletId: { type: 'string' }
  },
  required: ['walletId']
})

export class SetDefaultWalletService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const transaction = this.context.sequelizeTransaction
      const walletId = this.args.walletId
      const userId = this.args.userId

      const wallet = await this.context.sequelize.models.wallet.findOne({ where: { userId, id: walletId }, transaction })
      if (!wallet) return this.addError('InvalidWalletIdErrorType')

      await this.context.sequelize.models.wallet.update(
        { isDefault: false },
        { where: { userId, id: { [Op.ne]: walletId } }, transaction }
      )
      wallet.isDefault = true
      await wallet.save({ transaction })
      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
