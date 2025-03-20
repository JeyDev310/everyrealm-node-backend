import ServiceError from '@src/errors/service.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import Web3 from 'web3'
import { CheckAndUpdateAllLimits } from '../responsibleGambling/checkAndUpdateAllLimits.service'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    publicAddress: { type: 'string' },
    signature: { type: 'string' }
  },
  required: ['publicAddress', 'signature']
})

export class VerifySignatureService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { publicAddress, signature } = this.args
    const transaction = this.context.sequelizeTransaction
    try {
      const user = await this.context.sequelize.models.user.findOne({
        where: { publicAddress: publicAddress }
      })
      if (!user) return this.addError('UserDoesNotExistsErrorType')
      const message = `ARC:${user.nonce}`
      const web3 = new Web3()
      const recoveredAddress = web3.eth.accounts.recover(message, signature)
      if (recoveredAddress.toLowerCase() !== publicAddress.toLowerCase()) return this.addError('InvalidAddressIdErrorType')
      user.loggedIn = true
      user.loggedInAt = new Date()
      user.lastLoggedInIp = this.args.ipAddress
      await user.save({ transaction })

      await CheckAndUpdateAllLimits.execute({ userId: user.id }, this.context)

      return { user }
    } catch (error) {
      throw new ServiceError(error)
    }
  }
}
