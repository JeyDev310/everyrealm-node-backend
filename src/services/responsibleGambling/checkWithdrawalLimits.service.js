import { sequelize } from '@src/database'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { dayjs } from '@src/libs/dayjs'
import ServiceBase from '@src/libs/serviceBase'
import { SETTING_KEYS } from '@src/utils/constants/app.constants'
import { GetSettingsService } from '../common/getSettings.service'
import { CURRENCY_TYPES } from '@src/utils/constants/public.constants.utils'
import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper'
import { GetWithdrawalsInEuro } from './getWithdrawalsInEuro.servie'
import { sendSlackMessage } from '@src/utils/slack.util'
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    walletId: { type: 'string' },
    amount: { type: 'number' },
    userId: { type: 'string' },
    skipSlackNotification: { type: 'boolean' }
  },
  required: ['walletId', 'userId', 'amount']
})

// Add new helper functions
const checkLimit = (currentTotal, limitValue, amountToAdd) => {
  return limitValue > 0 && (currentTotal + amountToAdd) >= limitValue
}

const createSlackMessage = (limitType, limitValue, user, currency, currentTotal, amountToAdd) => {
  switch (limitType) {
    case 'Global All Currencies Sum Withdrawal Limit':
      return `The global all currencies withdrawal limit of ${limitValue} EUR has been reached. The last failed withdrawal attempt was by ${user.username} with email ${user.email}.`

    case 'Player All Currencies Sum Withdrawal Limit':
      return `The per player all currencies limit of ${limitValue} EUR has been reached for ${user.username} with email ${user.email}. Their last withdrawal was with ${currency || 'N/A'}. Their current withdrawal total is ${currentTotal + amountToAdd} EUR.`

    case 'Player Daily All Currencies Sum Withdrawal Limit':
      return `The per player all currencies daily limit of ${limitValue} EUR has been reached for ${user.username} with email ${user.email}. Their current withdrawal total is ${currentTotal + amountToAdd} EUR.`

    case 'Specific Player Total Withdrawal Limit':
      return `The specific per player total withdrawal limit of ${limitValue} EUR has been reached for ${user.username} with email ${user.email}. Their last withdrawal was with ${currency}. Their current withdrawal total is ${currentTotal + amountToAdd} EUR.`

    case 'Specific Player Total Daily Withdrawal Limit':
      return `The specific per player total daily withdrawal limit of ${limitValue} EUR has been reached for ${user.username} with email ${user.email}. Their current withdrawal total is ${currentTotal + amountToAdd} EUR.`

    case 'Global Withdrawal Limit':
      return `The global ${currency} limit of ${limitValue} EUR has been reached. The last failed withdrawal attempt was done by ${user.username} with email ${user.email}.`

    case 'Player Withdrawal Limit':
      return `The per player ${currency} limit of ${limitValue} EUR has been reached for ${user.username} with email ${user.email}. Their last withdrawal was with ${currency}. Their current withdrawal total is ${currentTotal + amountToAdd} EUR.`

    case 'Player Daily Withdrawal Limit':
      return `The per player ${currency} daily limit of ${limitValue} EUR has been reached for ${user.username} with email ${user.email}. Their current withdrawal total is ${currentTotal + amountToAdd} EUR.`

    case 'Specific Player Withdrawal Limit':
      return `The specific per player ${currency} limit of ${limitValue} EUR has been reached for ${user.username} with email ${user.email}. Their last withdrawal was with ${currency}. Their current withdrawal total is ${currentTotal + amountToAdd} EUR.`

    case 'Specific Player Daily Withdrawal Limit':
      return `The specific per player ${currency} daily limit of ${limitValue} EUR has been reached for ${user.username} with email ${user.email}. Their current withdrawal total is ${currentTotal + amountToAdd} EUR.`

    default:
      return `Withdrawal limit (${limitValue} EUR) reached for user ${user.username} with email ${user.email}${currency ? ` for currency ${currency}` : ''}. Current total: ${currentTotal + amountToAdd} EUR`
  }
}

export class CheckWithdrawalLimits extends ServiceBase {
  get constraints () {
    return constraints
  }
  async run () {
    const isInternalTransaction = !this?.context?.sequelizeTransaction
    const transaction = this?.context?.sequelizeTransaction || await sequelize.transaction()

    try {
      // Early validation - Get wallet data
      const wallet = await this.getWalletData(transaction)
      if (!wallet) {
        return this.addError('WalletNotFoundError')
      }

      // Destructure commonly used values
      const { user, currency } = wallet
      const amountToAdd = this.args.amount ? convertCryptoToFiat(this.args.amount, currency.exchangeRate) : 0
      const skipSlackNotification = this.args.skipSlackNotification || false
      // Get all required data in parallel
      const [
        { result: settings },
        { result: globalTotalInEuro },
        { result: playerTotalInEuro },
        { result: playerDailyTotalInEuro }
      ] = await Promise.all([
        GetSettingsService.execute({
          keys: [
            SETTING_KEYS.GLOBAL_TOTAL_WITHDRAWAL_LIMIT,
            SETTING_KEYS.PLAYER_TOTAL_WITHDRAWAL_LIMIT,
            SETTING_KEYS.PLAYER_DAILY_TOTAL_WITHDRAWAL_LIMIT
          ]
        }, this.context),
        GetWithdrawalsInEuro.execute({
          type: 'global',
          userId: this.args.userId,
          specificCurrency: wallet.currencyId
        }, this.context),
        GetWithdrawalsInEuro.execute({
          type: 'player',
          userId: this.args.userId,
          specificCurrency: wallet.currencyId
        }, this.context),
        GetWithdrawalsInEuro.execute({
          type: 'playerDaily',
          userId: this.args.userId,
          specificCurrency: wallet.currencyId
        }, this.context)
      ])

      logger.info('==========globalTotalInEuro===========', {globalTotalInEuro})
      logger.info('==========playerTotalInEuro===========', {playerTotalInEuro})
      logger.info('==========playerDailyTotalInEuro===========', {playerDailyTotalInEuro})

      // Check all-currencies limits
      const allCurrencyLimits = [
        {
          check: checkLimit(globalTotalInEuro.totalInEuro, settings[SETTING_KEYS.GLOBAL_TOTAL_WITHDRAWAL_LIMIT], amountToAdd),
          message: createSlackMessage('Global All Currencies Sum Withdrawal Limit', settings[SETTING_KEYS.GLOBAL_TOTAL_WITHDRAWAL_LIMIT], user, currency.code, globalTotalInEuro.totalInEuro, amountToAdd),
          errorMessage: 'AllCurrenciesWithdrawalLimitExceededErrorType'
        },
        {
          check: user.specificPlayerTotalWithdrawalLimit === 0 && checkLimit(playerTotalInEuro.totalInEuro, settings[SETTING_KEYS.PLAYER_TOTAL_WITHDRAWAL_LIMIT], amountToAdd),
          message: createSlackMessage('Player All Currencies Sum Withdrawal Limit', settings[SETTING_KEYS.PLAYER_TOTAL_WITHDRAWAL_LIMIT], user, currency.code, playerTotalInEuro.totalInEuro, amountToAdd),
          errorMessage: 'AllCurrenciesWithdrawalLimitExceededErrorType'
        },
        {
          check: user.specificPlayerTotalDailyWithdrawalLimit === 0 && checkLimit(playerDailyTotalInEuro.totalInEuro, settings[SETTING_KEYS.PLAYER_DAILY_TOTAL_WITHDRAWAL_LIMIT], amountToAdd),
          message: createSlackMessage('Player Daily All Currencies Sum Withdrawal Limit', settings[SETTING_KEYS.PLAYER_DAILY_TOTAL_WITHDRAWAL_LIMIT], user, currency.code, playerDailyTotalInEuro.totalInEuro, amountToAdd),
          errorMessage: 'AllCurrenciesDailyWithdrawalLimitExceededErrorType'
        },
        {
          check: checkLimit(playerTotalInEuro.totalInEuro, user.specificPlayerTotalWithdrawalLimit, amountToAdd),
          message: createSlackMessage('Specific Player Total Withdrawal Limit', user.specificPlayerTotalWithdrawalLimit, user, currency.code, playerTotalInEuro.currencyBasedTotalInEuro, amountToAdd),
          errorMessage: 'AllCurrenciesWithdrawalLimitExceededErrorType'
        },
        {
          check: checkLimit(playerDailyTotalInEuro.totalInEuro, user.specificPlayerTotalDailyWithdrawalLimit, amountToAdd),
          message: createSlackMessage('Specific Player Total Daily Withdrawal Limit', user.specificPlayerTotalDailyWithdrawalLimit, user, currency.code, playerDailyTotalInEuro.totalInEuro, amountToAdd),
          errorMessage: 'AllCurrenciesDailyWithdrawalLimitExceededErrorType'
        }
      ]

      for (const { check, message, errorMessage } of allCurrencyLimits) {
        if (check) {
          if(!skipSlackNotification) await sendSlackMessage(message)
          if (isInternalTransaction) await transaction.commit()
          return this.addError(errorMessage)
        }
      }

      // Check currency-specific and player-specific limits
      const currencySpecificLimits = [
        {
          check: checkLimit(globalTotalInEuro.currencyBasedTotalInEuro, currency.globalWithdrawalLimit, amountToAdd),
          message: createSlackMessage('Global Withdrawal Limit', currency.globalWithdrawalLimit, user, currency.code, globalTotalInEuro.currencyBasedTotalInEuro, amountToAdd),
          errorMessage: 'CurrencySpecificWithdrawalLimitExceededErrorType'
        },
        {
          check: wallet.walletWithdrawalLimit === 0 &&
                 checkLimit(playerTotalInEuro.currencyBasedTotalInEuro, currency.playerWithdrawalLimit, amountToAdd),
          message: createSlackMessage('Player Withdrawal Limit', currency.playerWithdrawalLimit, user, currency.code, playerTotalInEuro.currencyBasedTotalInEuro, amountToAdd),
          errorMessage: 'CurrencySpecificWithdrawalLimitExceededErrorType'
        },
        {
          check: wallet.walletDailyWithdrawalLimit === 0 &&
                 checkLimit(playerDailyTotalInEuro.currencyBasedTotalInEuro, currency.playerDailyWithdrawalLimit, amountToAdd),
          message: createSlackMessage('Player Daily Withdrawal Limit', currency.playerDailyWithdrawalLimit, user, currency.code, playerDailyTotalInEuro.currencyBasedTotalInEuro, amountToAdd),
          errorMessage: 'CurrencySpecificDailyWithdrawalLimitExceededErrorType'
        },
        {
          check: checkLimit(playerTotalInEuro.currencyBasedTotalInEuro, wallet.walletWithdrawalLimit, amountToAdd),
          message: createSlackMessage('Specific Player Withdrawal Limit', wallet.walletWithdrawalLimit, user, currency.code, playerTotalInEuro.currencyBasedTotalInEuro, amountToAdd),
          errorMessage: 'CurrencySpecificWithdrawalLimitExceededErrorType'
        },
        {
          check: checkLimit(playerDailyTotalInEuro.currencyBasedTotalInEuro, wallet.walletDailyWithdrawalLimit, amountToAdd),
          message: createSlackMessage('Specific Player Daily Withdrawal Limit', wallet.walletDailyWithdrawalLimit, user, currency.code, playerDailyTotalInEuro.currencyBasedTotalInEuro, amountToAdd),
          errorMessage: 'CurrencySpecificDailyWithdrawalLimitExceededErrorType'
        }
      ]

      for (const { check, message, errorMessage } of currencySpecificLimits) {
        if (check) {
          if(!skipSlackNotification) await sendSlackMessage(message)
          if (isInternalTransaction) await transaction.commit()
          return this.addError(errorMessage)
        }
      }

      if (isInternalTransaction) await transaction.commit()
      return { success: true }
    } catch (error) {
      if (isInternalTransaction) await transaction.rollback()
      throw new APIError(error)
    }
  }

  async getWalletData(transaction) {
    return sequelize.models.wallet.findOne({
      where: { id: this.args.walletId },
      include: [{
        model: sequelize.models.currency,
        where: { type: CURRENCY_TYPES.CRYPTO }
      }, {
        model: sequelize.models.user,
        where: { id: this.args.userId },
        attributes: ['email', 'username', 'id', 'specificPlayerTotalWithdrawalLimit', 'specificPlayerTotalDailyWithdrawalLimit']
      }],
      required: true,
      transaction
    })
  }
}
