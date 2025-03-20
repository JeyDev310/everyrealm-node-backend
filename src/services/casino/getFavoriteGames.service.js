import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { GetIpLocationService } from '@src/services/common/getIpLocation.service'
import { Op } from 'sequelize'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'number' },
    ipAddress: { type: 'string' },
    pageNo: { type: 'number', minimum: 1, default: 1 },
    limit: { type: 'number', minimum: 10, default: 10 }
  },
  required: ['userId', 'ipAddress']
})

export class GetFavoriteGamesService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { limit, pageNo } = this.args

    try {
      const { result: country } = await GetIpLocationService.execute({ ipAddress: this.args.ipAddress }, this.context)

      const favoriteGames = await this.context.sequelize.models.favoriteGame.findAndCountAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        where: { userId: this.args.userId },
        include: [{
          attributes: ['id', 'name', 'iconUrl', 'casinoProviderId', 'returnToPlayer', 'uniqueId', 'demoAvailable', 'devices', 'restrictedCountries'],
          model: this.context.sequelize.models.casinoGame,
          required: true,
          where: {
            isActive: true,
            [Op.not]: {
              restrictedCountries: {
                [Op.contains]: country.id
              }
            }
          },
          include: [
           {
            attributes: ['name'],
            model: this.context.sequelize.models.casinoProvider,
            required: true,
            where: {
              isActive: true,
              [Op.not]: {
                restrictedCountries: {
                  [Op.contains]: country.id
                }
              }
            }
          }]
        }],
        limit,
        offset: (pageNo - 1) * limit
      })

      return { favoriteGames }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
