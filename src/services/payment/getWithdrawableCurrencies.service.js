import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { CheckWithdrawalLimits } from '../responsibleGambling/checkWithdrawalLimits.service'
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
  },
  required: ['userId']
})

export class GetWithdrawableCurrenciesService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      const userId = this.args.userId
      const transaction = this.context.sequelizeTransaction
      const WalletModel = this.context.sequelize.models.wallet
      const CurrencyModel = this.context.sequelize.models.currency

      const wallets = await WalletModel.findAll({
        where: { userId },
        attributes: ['id', 'currencyId'],
        include: [{
          model: CurrencyModel,
          attributes: ['id', 'code'],
        }],
        transaction
      })


      const withdrawableCurrencies = [];

      for (const wallet of wallets) {
        try {
          const result = await CheckWithdrawalLimits.execute({
            walletId: wallet.id,
            userId: userId,
            amount: 0,
            skipSlackNotification: true
          }, this.context)

          if (!result.success) {
            // Check if it's the all currencies limit error
            if (result?.errors?.CheckWithdrawalLimits?.WithdrawalLimitForAllCurrenciesExceededErrorType) {
              return [] // Early return for all-currencies limit exceeded
            }
            // For other errors, continue checking other wallets
            continue
          }

          if (result.success) {
            withdrawableCurrencies.push(wallet.currency);
          }
        } catch (error) {
          logger.error('==========Error in CheckWithdrawalLimits===========',  { message: error.message, stack: error.stack })
        }
      }

      return withdrawableCurrencies
    } catch (error) {
      throw new APIError(error)
    }
  }
}
