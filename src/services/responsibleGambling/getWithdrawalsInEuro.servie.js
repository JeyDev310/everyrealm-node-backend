import { sequelize } from '@src/database'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { dayjs } from '@src/libs/dayjs'
import ServiceBase from '@src/libs/serviceBase'
import { SETTING_KEYS } from '@src/utils/constants/app.constants'
import { GetSettingsService } from '../common/getSettings.service'
import { CURRENCY_TYPES } from '@src/utils/constants/public.constants.utils'
import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper'
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    type: { enum: ['global', 'player', 'playerDaily'] },
    userId: { type: 'string' },
    specificCurrency: { type: 'string' }
  },
  required: ['type', 'userId']
})

export class GetWithdrawalsInEuro extends ServiceBase {
  get constraints () {
    return constraints
  }
  async run () {
    const isInternalTransaction = !this?.context?.sequelizeTransaction
    const transaction = this?.context?.sequelizeTransaction || await sequelize.transaction()
    const specificCurrency = this.args.specificCurrency
    const currencies = await this.context.sequelize.models.currency.findAll({ where: { type: CURRENCY_TYPES.CRYPTO } })

    let totalInEuro = 0
    let currencyBasedTotalInEuro = 0
    try {
      if(this.args.type === 'global') {
        const { result: settings } = await GetSettingsService.execute({ keys: [SETTING_KEYS.TOTAL_WITHDRAWALS] }, this.context)
        const totalWithdrawals = JSON.parse(settings[SETTING_KEYS.TOTAL_WITHDRAWALS])

        for (const [currencyId, amount] of Object.entries(totalWithdrawals)) {
          const currency = currencies.find(c => c.id === currencyId)
          if (currency) {
            if(specificCurrency == currency.id) {
              currencyBasedTotalInEuro = convertCryptoToFiat(amount, currency.exchangeRate)
            }
            totalInEuro += convertCryptoToFiat(amount, currency.exchangeRate)
          }
        }
      } else if(this.args.type === 'player') {

        for (const currency of currencies) {

            const [results] = await this.context.sequelize.query(`
              SELECT
                COALESCE(SUM(l.amount), 0) AS total_amount
            FROM
              transactions t
            JOIN
              ledgers l
            ON
              t.ledger_id = l.id
            WHERE
              t.status = 'completed'
              AND l.purpose = 'Withdraw'
              AND t.user_id = :userId
              AND l.currency_id = :currencyId
              AND t.payment_id IS NOT NULL
          `, {
            replacements: {
              userId: this.args.userId,
              currencyId: currency.id
            },
            transaction
          })

          const amount = results[0]?.total_amount || 0
          totalInEuro += convertCryptoToFiat(amount, currency.exchangeRate)
          if(specificCurrency == currency.id) {
            currencyBasedTotalInEuro = convertCryptoToFiat(amount, currency.exchangeRate)
          }
        }

      } else if(this.args.type === 'playerDaily') {

        for (const currency of currencies) {
          const [results] = await this.context.sequelize.query(`
            SELECT
              COALESCE(SUM(l.amount), 0) AS total_amount
            FROM
              transactions t
            JOIN
              ledgers l
            ON
              t.ledger_id = l.id
            WHERE
              t.status = 'completed'
              AND l.purpose = 'Withdraw'
              AND t.user_id = :userId
              AND l.currency_id = :currencyId
              AND t.payment_id IS NOT NULL
              AND DATE(t.created_at) = '${dayjs().format('YYYY-MM-DD')}'
          `, {
            replacements: {
              userId: this.args.userId,
              currencyId: currency.id
            },
            transaction
          })
          const amount = results[0]?.total_amount || 0
          totalInEuro += convertCryptoToFiat(amount, currency.exchangeRate)
          if(specificCurrency == currency.id) {

            currencyBasedTotalInEuro = convertCryptoToFiat(amount, currency.exchangeRate)
          }
        }

      }

      if (isInternalTransaction) await transaction.commit()
      return { totalInEuro, currencyBasedTotalInEuro }
    } catch (error) {
      logger.error('=======Error In CheckWithdrawalLimits=========',  { message: error.message, stack: error.stack })
      if (isInternalTransaction) await transaction.rollback()
      throw new APIError(error)
    }
  }
}
