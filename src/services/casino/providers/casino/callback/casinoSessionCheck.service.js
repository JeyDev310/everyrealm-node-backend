import { appConfig } from '@src/configs'
import ajv from '@src/libs/ajv'
import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'
import Jwt from 'jsonwebtoken'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    token: { type: 'string' }
  },
  required: ['userId', 'token']
})

export class CasinoSessionCheckService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id', 'username', 'isActive'],
        where: { id: this.args.userId, isActive: true }
      })
      if (!user) return casinoErrorTypes.USER_NOT_FOUND

      const decodedData = Jwt.decode(this.args.token, appConfig.jwt.secret)
      const paylod = { status: true }
      if (Date.now() >= decodedData.exp * 1000) {
        paylod.newToken = Jwt.sign({ userId: decodedData.userId, walletId: decodedData.walletId }, appConfig.jwt.secret, { expiresIn: appConfig.jwt.expiry })
      }

      return { status: true }
    } catch (error) {
      return casinoErrorTypes.UNKNOWN_ERROR
    }
  }
}
