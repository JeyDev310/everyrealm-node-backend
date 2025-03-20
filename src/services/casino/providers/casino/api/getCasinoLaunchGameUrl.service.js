import { appConfig, casinoGaming } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

import Jwt from 'jsonwebtoken'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    isDemo: { type: 'boolean', default: true },
    userId: { type: 'string' },
    walletId: { type: 'string' },
    ipAddress: { type: 'string' },
    gameId: { type: 'string' },
    countryCode: { type: 'string' },
    tournamentId: { type: 'string', default: null }
  },
  required: ['gameId', 'ipAddress']
})

export class GetCasinoLaunchGameUrlService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const userId = this.args.userId
    const walletId = this.args.walletId
    const gameId = this.args.gameId
    const isDemo = this.args.isDemo
    const countryCode = this.args.countryCode
    const ipAddress = this.args.ipAddress
    const tournamentId = this.args.tournamentId

    try {
      let link = `${casinoGaming.casinoUrl}start?demo=${isDemo}&gameId=${gameId}`

      if (userId && walletId && !isDemo) {
        const user = await this.context.sequelize.models.user.findOne({
          where: { id: userId },
          include: {
            attributes: ['code'],
            model: this.context.sequelize.models.language
          }
        })

        if (!user) this.addError('UserDoesNotExistsErrorType')

        const token = Jwt.sign({ userId, walletId, tournamentId }, appConfig.jwt.secret, { expiresIn: appConfig.jwt.expiry })
        link += `&token=${token}&userId=${user.id}&lang=${user?.language?.code || 'EN'}&ip=${ipAddress}&country=${countryCode || 'IN'}`
      }

      return link
    } catch (error) {
      throw new APIError(error)
    }
  }
}
