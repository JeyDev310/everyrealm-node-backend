import { APIError } from '@src/errors/api.error';
import ajv from '@src/libs/ajv';
import ServiceBase from '@src/libs/serviceBase';
import { MOONPAY_CURRENCY_TO_CURRENCY_SYMBOL, PAYMENT_PROVIDERS, TRANSACTION_STATUS } from '@src/utils/constants/payment.constants';
import { WEBHOOK_RESPONSE } from '@src/utils/constants/paymentProviders/coinPayment.constants';
import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils';
import { logger } from "@src/utils/logger";
import { CreatePaymentTransactionService } from '../createPaymentTransaction.service';
import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper'
import crypto from 'crypto';

const constraints = ajv.compile({
  type: 'object',
    properties: {
    data: {
      type: 'object',
      properties: {
        isFromQuote: { type: 'boolean' },
        getValidQuote: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            transactionId: { type: 'string' },
            baseCurrencyId: { type: 'string' },
            baseCurrencyAmount: { type: 'number' },
            quoteCurrencyId: { type: 'string' },
            quoteCurrencyAmount: { type: 'number' },
            quoteCurrencyPrice: { type: 'number' },
            feeAmount: { type: 'number' },
            extraFeeAmount: { type: 'number' },
            networkFeeAmount: { type: 'number' },
            networkFeeAmountNonRefundable: { type: 'boolean' },
            areFeesIncluded: { type: 'boolean' },
            isValid: { type: 'boolean' },
            signature: { type: 'string' },
            provider: { type: 'string' },
            externalId: { type: ['string', 'null'] },
            quoteCurrencySpreadPercentage: { type: 'number' }
          }
        },
        isRecurring: { type: 'boolean' },
        id: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        baseCurrencyAmount: { type: 'number' },
        quoteCurrencyAmount: { type: 'number' },
        feeAmount: { type: 'number' },
        extraFeeAmount: { type: 'number' },
        networkFeeAmount: { type: 'number' },
        areFeesIncluded: { type: 'boolean' },
        flow: { type: 'string' },
        status: { type: 'string' },
        walletAddress: { type: 'string' },
        walletAddressTag: { type: ['string', 'null'] },
        cryptoTransactionId: { type: ['string', 'null'] },
        failureReason: { type: 'string' },
        redirectUrl: { type: 'string' },
        returnUrl: { type: 'string' },
        widgetRedirectUrl: { type: ['string', 'null'] },
        bankTransferReference: { type: ['string', 'null'] },
        baseCurrencyId: { type: 'string' },
        currencyId: { type: 'string' },
        customerId: { type: 'string' },
        cardId: { type: 'string' },
        bankAccountId: { type: ['string', 'null'] },
        eurRate: { type: 'number' },
        usdRate: { type: 'number' },
        gbpRate: { type: 'number' },
        bankDepositInformation: { type: ['string', 'null'] },
        externalTransactionId: { type: ['string', 'null'] },
        feeAmountDiscount: { type: ['number', 'null'] },
        extraFeeAmountDiscount: { type: ['number', 'null'] },
        paymentMethod: { type: 'string' },
        baseCurrency: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            type: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            precision: { type: 'number' },
            decimals: { type: ['number', 'null'] },
            icon: { type: 'string' },
            maxAmount: { type: 'number' },
            minAmount: { type: 'number' },
            minBuyAmount: { type: 'number' },
            maxBuyAmount: { type: 'number' },
            isSellSupported: { type: 'boolean' }
          }
        },
        currency: {
          type: 'object',
          properties: {
            notAllowedUSStates: { type: 'array', items: { type: 'string' } },
            notAllowedCountries: { type: 'array', items: { type: 'string' } },
            id: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            type: { type: 'string' },
            name: { type: 'string' },
            code: { type: 'string' },
            precision: { type: 'number' },
            decimals: { type: 'number' },
            icon: { type: 'string' },
            maxAmount: { type: 'number' },
            minAmount: { type: 'number' },
            minBuyAmount: { type: 'number' },
            maxBuyAmount: { type: 'number' },
            isSellSupported: { type: 'boolean' },
            addressRegex: { type: 'string' },
            testnetAddressRegex: { type: 'string' },
            supportsAddressTag: { type: 'boolean' },
            addressTagRegex: { type: ['string', 'null'] },
            supportsTestMode: { type: 'boolean' },
            supportsLiveMode: { type: 'boolean' },
            isSuspended: { type: 'boolean' },
            isSupportedInUS: { type: 'boolean' },
            isStableCoin: { type: 'boolean' },
            confirmationsRequired: { type: 'number' },
            minSellAmount: { type: 'number' },
            maxSellAmount: { type: 'number' },
            isSwapBaseSupported: { type: 'boolean' },
            isSwapQuoteSupported: { type: 'boolean' },
            isBaseAsset: { type: 'boolean' },
            metadata: { type: 'object' }
          }
        },
        country: { type: 'string' },
        state: { type: 'string' },
        cardType: { type: ['string', 'null'] },
        cardPaymentType: { type: ['string', 'null'] },
        externalCustomerId: { type: 'string' },
      }
    },
    type: { type: 'string' },
    externalCustomerId: { type: 'string' },
  }
});

export class MoonpayWebhookService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const sequlizeTransaction = this.context.sequelizeTransaction;
    try {

      const { data } = this.args;
      logger.info('Start(MoonpayWebhookService)', { data });
      const { id: moonpayTransactionId, walletAddress, baseCurrencyAmount, quoteCurrencyAmount, currency } = data;
      let { status } = data;
      const { code: currencyCode } = currency;

      const addressData = await this.context.sequelize.models.usersDepositAddress.findOne({
        where: { networkAddress: walletAddress, isActive: true }
      })

      if (!addressData) return WEBHOOK_RESPONSE.ADDRESS_NOT_FOUND
      const userId = addressData.userId
      const user = await this.context.sequelize.models.user.findOne({
        where: { id: userId },
        attributes: ['email', 'id'],
        include: {
          model: this.context.sequelize.models.wallet,
          include: {
            model: this.context.sequelize.models.currency,
            where: { code: MOONPAY_CURRENCY_TO_CURRENCY_SYMBOL[currencyCode].currencySymbol },
            attributes: ['code', 'id', 'exchangeRate']
          }
        },
        transaction: sequlizeTransaction
      })
      if (!user) return WEBHOOK_RESPONSE.USER_NOT_FOUND

      logger.info('==========status ===========', {status})
      const moonpayTransaction = await this.context.sequelize.models.transaction.findOne({
        where: { paymentId: moonpayTransactionId }
      })
      if (moonpayTransaction) {
        logger.info('==========Transaction found===========')
        if(status == TRANSACTION_STATUS.COMPLETED || status == TRANSACTION_STATUS.PENDING) {
          moonpayTransaction.status = status
          moonpayTransaction.moreDetails = { ...moonpayTransaction.moreDetails, moonpayDetails: data }
          await moonpayTransaction.save({ transaction: sequlizeTransaction })
        } else {
          moonpayTransaction.status = TRANSACTION_STATUS.FAILED
          moonpayTransaction.moreDetails = { ...moonpayTransaction.moreDetails, moonpayDetails: data }
          await moonpayTransaction.save({ transaction: sequlizeTransaction })
        }
        logger.info('==========Transaction saved===========')
      } else {

        logger.info('==========Creating transaction===========')
        const paymentProvider = await this.context.sequelize.models.paymentProvider.findOne({
          where: { aggregator: PAYMENT_PROVIDERS.MOONPAY },
          attributes: ['id']
        })

        let fiatAmount = baseCurrencyAmount
        let exchangeRate
        if (!fiatAmount) {
          const currencyId = addressData.currencyId
          const currency = await this.context.sequelize.models.currency.findOne({ where: { id: currencyId } });
          if (!currency) {
            logger.error('CreateTransactionService: currency not found', { userId, currencyId })
            return this.addError('CurrencyNotFoundErrorType')
          }
          exchangeRate = currency.exchangeRate;
          fiatAmount = convertCryptoToFiat(quoteCurrencyAmount, exchangeRate)
        } else {
          exchangeRate = quoteCurrencyAmount/fiatAmount
        }

        if (status == TRANSACTION_STATUS.COMPLETED) status = TRANSACTION_STATUS.COMPLETED
        else if (status == TRANSACTION_STATUS.PENDING) status = TRANSACTION_STATUS.PENDING
        else status = TRANSACTION_STATUS.FAILED

        await CreatePaymentTransactionService.execute(
          {
            userId: user.id,
            paymentId: moonpayTransactionId,
            paymentProviderId: paymentProvider?.id,
            amount: quoteCurrencyAmount,
            walletId: user?.wallets[0].id,
            moreDetails: { moonpayDetails: data },
            purpose: LEDGER_PURPOSE.DEPOSIT,
            status,
            fiatAmount,
            exchangeRate
          },
          this.context
        )
        logger.info('==========Transaction created===========')
      }




    } catch (error) {
      logger.error('=====================',  { message: error.message, stack: error.stack })
      throw new APIError(error)
    }
  }
}
