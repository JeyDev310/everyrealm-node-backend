import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    walletId: { type: 'string' }
  },
  required: ['userId', 'walletId']
})

export class CasinoPlayerDetailsService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'isActive'],
        where: { id: this.args.userId },
        include: {
          attributes: ['id', 'amount'],
          model: this.context.sequelize.models.wallet,
          where: { id: this.args.walletId, isDefault: true },
          include: {
            attributes: ['id', 'code'],
            model: this.context.sequelize.models.currency,
            required: true
          },
          required: true
        }
      })

      if (!user) return casinoErrorTypes.USER_NOT_FOUND
      if (!user.isActive || !user.username) return casinoErrorTypes.USER_BLOCKED

      return {
        status: true,
        userId: user.id,
        nickname: user.username,
        currency: user.wallets[0].currency.code,
        language: user.language || 'EN',
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    } catch (error) {
      logger.error('CasinoPlayerDetailsService:',  { message: error.message, stack: error.stack })
      throw new APIError(error);
    }
  }
}
