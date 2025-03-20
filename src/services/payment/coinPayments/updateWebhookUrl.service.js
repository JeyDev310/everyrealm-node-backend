import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { CoinPaymentAxios } from '@src/libs/axios/coinPayments.axios'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    symbol: { type: 'string' }
  },
  required: ['symbol']
})

export class UpdateWebhookUrlService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      const walletAddress = await this.context.sequelize.models.cryptoWalletAddress.findOne({
        where: { symbol: this.args.symbol }
      })
      if (!walletAddress) return this.addError('CurrencyNotAvailableErrorType')
      const url = `/merchant/wallets/${walletAddress.walletId}/webhook`
      const result = await CoinPaymentAxios.updateWebhookUrl(url, {
        notificationUrl: `${process.env.COIN_PAYMENTS_WEBHOOK_URL}`
      })
      return { success: true, data: result.data }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
