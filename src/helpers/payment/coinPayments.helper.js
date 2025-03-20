import CryptoJS from 'crypto-js'
import { coinPaymentPaymentGateWay } from '@src/configs/payment/coinPayment.config'
import { CoinPaymentAxios } from '@src/libs/axios/coinPayments.axios'

export const createHMACSignature = (data) => {
  let queryString = `\ufeff${data.method}${data.url}${coinPaymentPaymentGateWay.clientId}${data.date}`
  if (data.body) queryString = `${queryString}${JSON.stringify(data.body)}`
  const hash = CryptoJS.HmacSHA256(queryString, CryptoJS.enc.Utf8.parse(coinPaymentPaymentGateWay.clientSecret))
  const signature = CryptoJS.enc.Base64.stringify(hash)
  return signature
}

export const validateHMACSignature = (method, url, date, data) => {
  const queryString = `\ufeff${method}${url}${coinPaymentPaymentGateWay.clientId}${date}${JSON.stringify(data)}`
  const hash = CryptoJS.HmacSHA256(queryString, CryptoJS.enc.Utf8.parse(coinPaymentPaymentGateWay.clientSecret))
  const signature = CryptoJS.enc.Base64.stringify(hash)
  return signature
}

export const coinPaymentConversion = async (context, amount, from, to) => {
  const fromCurrencyId = await context.sequelize.models.cryptoWalletAddress.findOne({ where: { symbol: from }, attributes: ['currencyId'] })
  const toCurrencyId = await context.sequelize.models.cryptoWalletAddress.findOne({ where: { symbol: to }, attributes: ['currencyId'] })

  const endPoints = `/rates?from=${fromCurrencyId.currencyId}&to=${toCurrencyId.currencyId}`
  let response = await CoinPaymentAxios.getConversionRates(endPoints)
  response = JSON.parse(response?.data)
  amount = response.items[0]?.rate * amount
  return amount
}
