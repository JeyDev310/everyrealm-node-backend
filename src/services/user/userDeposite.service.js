import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { CreateLedgerService } from '@src/services/ledger/createLedger.service'
import { LEDGER_PURPOSE, TRANSACTION_STATUS } from '@src/utils/constants/public.constants.utils'
import _ from 'lodash'
import { logger } from "@src/utils/logger";
import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    walletId: { type: 'number' },
    userId: { type: 'number' },
    amount: { type: 'number' }
  },
  required: ['walletId', 'amount']
})

export class DepositService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    logger.info('Start(DepositService): ', { args: this.args });
    const { amount, userId, walletId } = this.args;
    const wallet = await this.context.sequelize.models.wallet.findOne({ where: { id: walletId, userId } });
    if (!wallet) {
      logger.error("DepositService: wallet not found", { userId, walletId });
      return this.addError("InvalidWalletIdErrorType");
    }
    const currency = await this.context.sequelize.models.currency.findOne({ where: { id: wallet.currencyId } })
    if (!currency) {
      logger.error('DepositService: currency not found', { userId, walletId })
      return this.addError('CurrencyNotFoundErrorType')
    }
    const exchangeRate = currency.exchangeRate;
    const fiatAmount = convertCryptoToFiat(amount, exchangeRate)
    try {
      const createLedgerResult = await CreateLedgerService.execute({
        amount,
        purpose: LEDGER_PURPOSE.DEPOSIT,
        userId,
        walletId,
        exchangeRate,
        fiatAmount
      }, this.context)
      if (_.size(createLedgerResult.errors)) {
        logger.error('CreateLedgerError(DepositService)');
        return this.mergeErrors(createLedgerResult.errors);
      }

      const tx = await this.context.sequelize.models.transaction.create({
        ledgerId: createLedgerResult.result.id,
        status: TRANSACTION_STATUS.COMPLETED,
        userId,
      }, { transaction: this.context.sequelizeTransaction })

      logger.info('Return(DepositService): ', { tx });
      return tx;
    } catch (error) {
      logger.error('UnknownError(DepositService): ',  { message: error.message, stack: error.stack });
      throw new APIError(error)
    }
  }
}
