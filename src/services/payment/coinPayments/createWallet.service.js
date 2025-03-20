import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { CoinPaymentAxios } from '@src/libs/axios/coinPayments.axios'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    currencyId: { type: 'string' }, // currency Id of coinpayment
    symbol: { type: 'string' }, // currency/token symbol in coinpayment
    label: { type: 'string' }

  },
  required: ['currencyId', 'label', 'symbol']
})

export class CreateWalletService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      const { symbol, currencyId } = this.args
      const address = await this.context.sequelize.models.cryptoWalletAddress.findOne({
        where: { symbol: symbol }
      })
      if (address) return this.addError('AddressAlreadyExistsErrorType')

      const currency = await this.context.sequelize.models.currency.findOne({
        where: { code: symbol.split('.')[0] },
      })
      if (!currency) return this.addError('CurrencyNotAvailableErrorType')


      const url = '/merchant/wallets'
      const data = {
        currencyId: currencyId,
        label: this.args.label,
        webhookUrl: `${appConfig.app.userBeUrl}/payment/coin-payments/webhook`,
        usePermanentAddresses: false
      }
      if (currencyId.includes(':')) {
        data.contractAddress = currencyId.split(':')[1]
        data.currencyId = currencyId.split(':')[0]
      }
      let response = await CoinPaymentAxios.createWallet(url, data)
      response = JSON.parse(response?.data)
      if (response.status !== 400) {
        await this.context.sequelize.models.cryptoWalletAddress.create({
          symbol: symbol,
          walletId: response.walletId,
          currencyId: currencyId,
          addressId: response?.address
        })
      }

      return response
    } catch (error) {
      throw new APIError(error)
    }
  }
}
