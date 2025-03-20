import { config } from '@src/configs/config'

export const coinPaymentPaymentGateWay = {
  clientId: config.get('coinPayment.clientId'),
  clientSecret: config.get('coinPayment.clientSecret'),
  ipnSecret: config.get('coinPayment.ipnSecret'),
  merchantId: config.get('coinPayment.merchantId'),
  baseUrl: config.get('coinPayment.baseUrl')
}
