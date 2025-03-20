import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { SignupWithAdressService } from './signupWithAddress.service'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    address: { type: 'string' }
  },
  required: ['address']
})

export class GenerateNonceService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const transaction = this.context.sequelizeTransaction
      const user = await this.context.sequelize.models.user.findOne({
        where: { publicAddress: this.args.address }
      })
      const nonce = new Date().getTime()
      if (!user) {
        await SignupWithAdressService.execute({ nonce: nonce, publicAddress: this.args.address }, this.context)
        return { nonce }
      }
      user.nonce = nonce
      await user.save({ transaction })
      return { nonce }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
