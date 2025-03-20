import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { GetBalanceService } from '@src/services/casino/common/GetBalance.service'
import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    walletId: { type: 'string' },
    tournamentId: { type: 'string', default: null }
  },
  required: ['userId', 'walletId']
})

export class CasinoGetBalanceService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const userId = this.args.userId
      const walletId = this.args.walletId
      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id', 'username', 'isActive'],
        where: { id: userId, isActive: true }
      })
      if (!user) return casinoErrorTypes.USER_NOT_FOUND
      const result = await GetBalanceService.execute({ userId, walletId }, this.context)
      return { status: true, balance: result.result }
    } catch (error) {
      return casinoErrorTypes.UNKNOWN_ERROR
    }
  }
}
