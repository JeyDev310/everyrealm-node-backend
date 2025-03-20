import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { CoinPaymentAxios } from '@src/libs/axios/coinPayments.axios'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    currencySymbol: { type: 'string', default: 'LTCT' },
    skip: { type: 'string' },
    count: { type: 'string' },

  },
  required: ['currencySymbol']
})

export class GetWalletAddressService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      const { currencySymbol, skip, count } = this.args
      const currencyAddress = await this.context.sequelize.models.cryptoWalletAddress.findOne({
        where: { symbol: currencySymbol }
      })
      if (!currencyAddress) return this.addError('CurrencyNotAvailableErrorType')

      const addressResponse = await CoinPaymentAxios.getWalletAddress(currencyAddress.walletId, skip, count)
      const response = JSON.parse(addressResponse?.data)
      return response
    } catch (error) {
      throw new APIError(error)
    }
  }
}
