import { coinPaymentPaymentGateWay } from '@src/configs/payment/coinPayment.config'
import { createHMACSignature } from '@src/helpers/payment/coinPayments.helper'
import { messages } from '@src/utils/constants/error.constants'
import { Axios } from 'axios' // Import axios instead of Axios
import { logger } from '@src/utils/logger'

export class CoinPaymentAxios extends Axios {
  constructor(endPoints, body, method) {
    const date = new Date().toISOString().split('.')[0]
    const url = `${coinPaymentPaymentGateWay.baseUrl}${endPoints}`
    super({
      baseURL: coinPaymentPaymentGateWay.baseUrl,
      method: method,
      headers: {
        'X-CoinPayments-Client': coinPaymentPaymentGateWay.clientId,
        'X-CoinPayments-Timestamp': date,
        'X-CoinPayments-Signature': createHMACSignature({ method, url, date, body }),
        'Content-Type': 'application/json'
      }
    })
  }

  static async createDepositAddress(url) {
    try {
      const coinPaymentsAxios = new CoinPaymentAxios(url, '', 'POST')
      const response = await coinPaymentsAxios.post(url)
      logger.info(`createDepositAddress Response: ${JSON.stringify(response.data)}`)
      return response
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  // for withdrawal
  static async createSpendRequest(url, body) {
    try {
      const coinPaymentsAxios = new CoinPaymentAxios(url, body, 'POST')
      const response = await coinPaymentsAxios.post(url, JSON.stringify(body))
      logger.info(`createSpendRequest Response: ${JSON.stringify(response.data)}`)
      return response
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  // for confirm withdrawal
  static async confirmSpendRequest(url, body) {
    try {
      const coinPaymentsAxios = new CoinPaymentAxios(url, body, 'POST')
      const response = await coinPaymentsAxios.post(url, JSON.stringify(body))
      logger.info(`confirmSpendRequest Response: ${JSON.stringify(response.data)}`)
      return response
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async getConversionRates(url) {
    try {
      const coinPaymentsAxios = new CoinPaymentAxios(url, '', 'GET')
      const response = await coinPaymentsAxios.get(url)
      logger.info(`getConversionRates Response: ${JSON.stringify(response.data)}`)
      return response
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  // API for wallet creation
  static async createWallet(url, body) {
    try {
      const coinPaymentsAxios = new CoinPaymentAxios(url, body, 'POST')
      const response = await coinPaymentsAxios.post(url, JSON.stringify(body))
      logger.info(`createWallet Response: ${JSON.stringify(response?.data)}`)
      return response
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async updateWebhookUrl(url, body) {
    try {
      const coinPaymentsAxios = new CoinPaymentAxios(url, body, 'PUT')
      const response = await coinPaymentsAxios.put(url, JSON.stringify(body))
      logger.info('updateWebhookUrl Response: ', { response: response })
      return response
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async getWalletAddress(walletIdStr, skip, count) {
    try {
      url = `/merchant/wallets/${walletIdStr}/addresses?skip=${skip}&take=${count}`
      const coinPaymentAxios = new CoinPaymentAxios(url, '', 'GET')
      const response = await coinPaymentAxios.get(url)
      logger.info(`getDepositAddress Response: ${JSON.stringify(response.data)}`)
      return response
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }

  static async getCurrencyDetails(url) {
    try {
      const coinPaymentsAxios = new CoinPaymentAxios(url, '', 'GET')
      const response = await coinPaymentsAxios.get(url)
      return response
    } catch (error) {
      throw messages.SERVICE_UNAVAILABLE
    }
  }
}
