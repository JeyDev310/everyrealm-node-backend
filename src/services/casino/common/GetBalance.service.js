import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    walletId: { type: 'string' },
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class GetBalanceService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const userId = this.args.userId
    const walletId = this.args.walletId

    try {
      const userWallet = await this.context.models.wallet.findOne({
        where: { userId, id: walletId }
      })
      return userWallet.amount
    } catch (error) {
      throw Error(error)
    }
  }
}
