import { casinoSoftSwissAggregatorConfig } from '@src/configs/casinoSoftSwissAggregator.config'
import { APIError } from '@src/errors/api.error'
import ServiceBase from '@src/libs/serviceBase'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import encode from 'crypto-js/enc-hex'
import { Op } from 'sequelize'
import ajv from 'src/libs/ajv'
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    betLevel: {type: 'string'},
    currency: { type: 'string' },
    freespinQuantity: { type: 'string'},
    gameIds: { type: 'array' },
    issueId: { type: 'string' },
    userId: { type: 'string' },
    validTo: { type: 'string' },
  },
  required: ['gameIds', 'userId', 'currency', 'issueId', 'validTo', 'freespinQuantity', 'betLevel']
})

export class AllowFreespinService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { betLevel, currency: currencyId, freespinQuantity, gameIds, issueId, userId, validTo } = this.args;
    logger.info('Start(AllowFreespinService):', { betLevel, currencyId, freespinQuantity, gameIds, issueId, userId, validTo });
    const AUTH_TOKEN = `${casinoSoftSwissAggregatorConfig.accessToken}`
    const { casinoGame, currency, user, wallet } = this.context.sequelize.models;
    let gameIdentifierArray = []

    try {
      const userDetails = await user.findOne({
        where: { id: userId },
        // attributes: ['uniqueId', 'email', 'username'],
        include: {
          attributes: ['id', 'userId', 'currencyId'],
          model: wallet,
          where: { currencyId },
          include: {
            attributes: ['id', 'code'],
            model: currency,
            required: true
          },
          required: true,
          separate: true
        }
      })
      const gameDetail = await casinoGame.findAll({
        where: { id: { [Op.in]: gameIds } },
        attributes: ['identifier']
      })
      gameDetail?.map(game => gameIdentifierArray.push(game.identifier))
      const parameters = {
        bet_level: +betLevel,
        casino_id: `${casinoSoftSwissAggregatorConfig.casinoId}`,
        currency: `EUR`,
        freespins_quantity: +freespinQuantity,
        games: gameIdentifierArray,
        issue_id: `${issueId}`,
        user: {
          country: 'US',
          email: `${userDetails.email}`,
          id: `${userDetails.uniqueId}_${userDetails.wallets[0].currency.code}`,
          nickname: `${userDetails?.username || 'test'}`,
          firstname: `${userDetails?.firstName || 'test'}`,
          lastname: `${userDetails?.lastName || 'test'}`,
          city: "Austin",
          date_of_birth: "1980-12-26",
          gender: "m",
          registered_at: "2025-01-11"
        },
        valid_until: validTo,
      }
      const token = CryptoJS.HmacSHA256(JSON.stringify(parameters), AUTH_TOKEN).toString(encode)
      const url = `${casinoSoftSwissAggregatorConfig.gcpUrl}/freespins/issue`;
      const response = await axios.post(url, parameters, { headers: { 'X-REQUEST-SIGN': token } });

      logger.info('Return(AllowFreespinService):', {response});
      return response
    } catch (error) {
      logger.error('UnknownError(AllowFreespinService):',  { message: error.message, stack: error.stack });
      throw new APIError(error)
    }
  }
}
