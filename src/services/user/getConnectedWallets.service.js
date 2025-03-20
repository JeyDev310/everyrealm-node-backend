import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class GetConnectedWallets extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const userId = this.args.userId;
    try {
      const result = await this.context.sequelize.models.user.findOne({
        attributes: ['moreDetails'],
        where: { id: userId}
      })
      const linked = result?.moreDetails?.privyUser?.linkedAccounts;

      if (!linked) 
        return {};

      const wallets = linked.filter(account => account.type === "wallet");
      const defaultLinkedWalletAddress = result?.moreDetails?.defaultLinkedWalletAddress;

      return { wallets, defaultLinkedWalletAddress }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
