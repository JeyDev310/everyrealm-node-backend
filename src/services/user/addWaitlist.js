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
    email: { type: 'string', format: 'email' }
  },
  required: ['email']
})

export class AddWaitlistService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const { email } = this.args
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
      const signedUpUser = user != null
      const privacyLink = frontendHost + '/info/privacy-policy'
      insertUpdate(Date.now(), { 
        email, 
        waitlisting: true, 
        signedUpUser,
        privacyLink,
        unsubscribeLink 
      })
      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
