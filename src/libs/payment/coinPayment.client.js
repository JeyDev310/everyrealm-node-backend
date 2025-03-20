import { coinPaymentPaymentGateWay } from '@src/configs/payment/coinPayment.config'
import Coinpayments from 'coinpayments'

export const coinPaymentClient = new Coinpayments({
  key: coinPaymentPaymentGateWay.clientId,
  secret: coinPaymentPaymentGateWay.clientSecret
})
