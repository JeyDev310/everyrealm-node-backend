import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { privy } from '@src/libs/privyClient'
import { getEmailFromPrivy } from '@src/utils'
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    userPrivyId: { type: 'string' }
  },
})

export class UpdatePrivyUserService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const transaction = this.context.sequelizeTransaction

      const user = await this.context.sequelize.models.user.findOne({
        where: { privyId: this.args.userPrivyId },
        include: [{
          model: this.context.sequelize.models.wallet,
          separate: true,
          include: {
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            model: this.context.sequelize.models.currency,
            where: { isActive: true },
            required: true
          }
        }, {
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          model: this.context.sequelize.models.address
        }],
        transaction
      })

      if (!user) return this.addError('UserDoesNotExistsErrorType')


      let privyUser = null
      try {
        privyUser = await privy.getUser(this.args.userPrivyId);
      } catch (error) {
        logger.error('Error while locating privy user.',  { message: error.message, stack: error.stack })
        return this.addError('UserDoesNotExistsErrorType')
      }

      const privyEmail = getEmailFromPrivy(privyUser)
      if(privyEmail) {
          user.email = privyEmail
          user.emailVerified = true
      } else {
        user.email = null
        user.emailVerified = false
      }


      let defaultWallet = user?.moreDetails?.defaultLinkedWalletAddress;
      const linkedWalletlList = privyUser?.linkedAccounts.filter(account => account.type === "wallet");
      const walletDetail = linkedWalletlList.filter(account => account.address === defaultWallet);

      if(!walletDetail?.length) {
        if(!linkedWalletlList) {
          defaultWallet = null;
        }
        else {
          let defaultWalletVerifiedAt = 0;
          linkedWalletlList.forEach(element => {
            if (new Date(element?.latestVerifiedAt).getTime() > defaultWalletVerifiedAt) {
              defaultWalletVerifiedAt = new Date(element?.latestVerifiedAt).getTime();
              defaultWallet = element.address;
            }
          });
        }

      }

      user.moreDetails = {
        ...user.moreDetails,
        defaultLinkedWalletAddress: defaultWallet,
        privyUser: privyUser
      }

      await user.save({ transaction })
      return { user }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
