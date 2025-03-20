import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    walletAddress: { type: 'string' },
  },
  required: ['userId']
})

export class SetDefaultLinkedWalletService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const transaction = this.context.sequelizeTransaction

      const userId = this.args.userId;
      const walletAddress = this.args.walletAddress;

      const userData = await this.context.sequelize.models.user.findOne({ 
        attributes: ["id", "moreDetails"], 
        where: { id: userId }, 
        transaction 
      })

      const linked = userData.moreDetails?.privyUser?.linkedAccounts;

      if (!linked) 
        return this.addError('LinkedWalletAddressNotFoundError')

      const linkedWallet = linked.filter(account => account.type === "wallet" && account.address === walletAddress);

      if (!linkedWallet?.length) 
        return this.addError('LinkedWalletAddressNotFoundError')
      
      userData.moreDetails.defaultLinkedWalletAddress = walletAddress;
      
      await this.context.sequelize.models.user.update(
        {
          moreDetails: userData.moreDetails,
        },
        {
          where: { id: userId }
        }, transaction
      )
        
      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
