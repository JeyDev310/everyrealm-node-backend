import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    casinoGameId: { type: 'string' }
  },
  required: ['userId', 'casinoGameId']
})

export class ToggleFavoriteGameService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const userId = this.args.userId
    const casinoGameId = this.args.casinoGameId

    try {
      const casinoGame = this.context.sequelize.models.casinoGame.findOne({ where: { id: casinoGameId } })
      if (!casinoGame) return this.addError('CasinoGameDoesNotExistsErrorType')

      const [favoriteGame, created] = await this.context.sequelize.models.favoriteGame.findOrCreate({
        defaults: { userId, casinoGameId },
        where: { userId, casinoGameId }
      })

      if (!created) await favoriteGame.destroy()

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
