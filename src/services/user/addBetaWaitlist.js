import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { insertUpdate } from '@src/libs/customerio/customerio'
import { User } from '@src/database/models/public/user'
const { Op } = require('sequelize');
import { appConfig, customerioConfig } from '@src/configs'


const constraints = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    telegram: { type: 'string' },
    country: { type: 'string' },
    favoriteCasinoGame: { type: 'string'}
  },
  required: ['email', 'country']
})

export class AddBetaWaitlistService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const { email, telegram, country, favoriteCasinoGame } = this.args
      const user = await User.findOne({
        where: {
          [Op.or]: [
            {
              more_details: {
                privyUser: {
                  email: {
                    address: email
                  }
                }
              }
            },
            {
              more_details: {
                privyUser: {
                  google: {
                    email: email
                  }
                }
              }
            }
          ]
        }
      });
      const frontendHost = appConfig.app.userFeUrl || 'https://app.dev.otherworld.xyz/fantasy'
      const unsubscribeLink = (user)? frontendHost + '/unsubscribe?utm=' + user.id : '#'
      const userName = user ? user.username : email;
      const privacyLink = frontendHost + '/info/privacy-policy'
      insertUpdate(Date.now(), { 
        email, 
        telegram, 
        country, 
        favoriteCasinoGame,
        tag: 'beta waitlist', 
        userName,
        privacyLink,
        unsubscribeLink 
      })
      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
