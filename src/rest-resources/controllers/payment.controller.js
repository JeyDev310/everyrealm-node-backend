import { decorateResponse } from '@src/helpers/response.helpers'

import { CoinPayWebhookService } from '@src/services/payment/coinPayments/coinPayWebhook.service'
import { CreateWalletService } from '@src/services/payment/coinPayments/createWallet.service'
import { CoinPayDepositAmountService } from '@src/services/payment/coinPayments/depositAmount.service'
import { CoinPayWithdrawAmountService } from '@src/services/payment/coinPayments/withdrawAmount.service'
import { UpdateWebhookUrlService } from '@src/services/payment/coinPayments/updateWebhookUrl.service'
import { GetWalletAddressService } from '@src/services/payment/coinPayments/getWalletAddress.service'
import { MoonpayWebhookService } from '@src/services/payment/moonpayPayments/moonpayWebhook.service'
import { GetSignatureService } from '@src/services/payment/moonpayPayments/getSignature.service'
import { GetWithdrawableCurrenciesService } from '@src/services/payment/getWithdrawableCurrencies.service'
import { logger } from '@src/utils/logger'

export class CoinPaymentsController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async coinPaymentDepositAmount(req, res, next) {
    try {
      const result = await CoinPayDepositAmountService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getWithdrawableCurrencies(req, res, next) {
    try {
      const result = await GetWithdrawableCurrenciesService.execute({ userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async coinPaymentWebhhok(req, res, next) {
    try {
      const result = await CoinPayWebhookService.execute({ ...req.body }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async moonpayGetSignature(req, res, next) {
    try {
      const result = await GetSignatureService.execute({ ...req.body }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async moonpayWebhook(req, res, next) {
    try {
      const result = await MoonpayWebhookService.execute({ ...req.body }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async coinPaymentWithdrawAmount(req, res, next) {
    try {
      const result = await CoinPayWithdrawAmountService.execute({ userId: req.authenticated.userId, ...req.body }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async createCurrencyWallet(req, res, next) {
    try {
      const result = await CreateWalletService.execute({ userId: req.authenticated.userId, ...req.body }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async updateWebhookUrl(req, res, next) {
    try {
      const result = await UpdateWebhookUrlService.execute({ userId: req.authenticated.userId, ...req.body }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getWalletAddress(req, res, next) {
    try {
      const result = await GetWalletAddressService.execute({ ...req.query }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }
}
