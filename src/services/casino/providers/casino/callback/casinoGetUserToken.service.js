import { appConfig } from '@src/configs'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'
import Jwt from 'jsonwebtoken'
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class CasinoGetUserTokenService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id', 'emailVerified', 'isActive'],
        where: { id: this.args.userId },
        include: {
          attributes: ['id', 'amount'],
          model: this.context.sequelize.models.wallet,
          required: true,
          where: { isDefault: true }
        }
      })

      if (!user) return casinoErrorTypes.USER_NOT_FOUND
      if (!user.emailVerified || !user.isActive) return casinoErrorTypes.USER_BLOCKED

      const wallet = user.wallets[0]

      return {
        status: true,
        balance: wallet.amount,
        userId: user.id,
        token: Jwt.sign({ userId: user.id, walletId: wallet.id }, appConfig.jwt.secret, { expiresIn: appConfig.jwt.expiry })
      }
    } catch (error) {
      logger.error('CasinoGetUserTokenService:',  { message: error.message, stack: error.stack })
      throw error
    }
  }
}
