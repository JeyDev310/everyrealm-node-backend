import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { CreateLedgerService } from '@src/services/ledger/createLedger.service'
import { AMOUNT_TYPES, LEDGER_PURPOSE, TRANSACTION_STATUS } from '@src/utils/constants/public.constants.utils'
import _ from 'lodash'
import { sequelize } from '@src/database'
import { logger } from "@src/utils/logger";
import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    paymentId: { type: 'string' },
    paymentProviderId: { type: 'number' },
    amount: { type: 'number' },
    walletId: { type: 'string' },
    moreDetails: { type: 'object' },
    purpose: { enum: Object.values(LEDGER_PURPOSE) },
    amountType: { enum: Object.values(AMOUNT_TYPES), default: AMOUNT_TYPES.CASH },
    fiatAmount: { type: 'number' },
    lockWallet: { type: 'boolean' },
    exchangeRate: { type: 'string' },
    seqTransaction: { type: ['object', 'array', 'null'] }
  },
  required: ['userId', 'walletId', 'purpose', 'amount']
})

export class CreateTransactionService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      logger.info("=============inside transaction service========");
      logger.debug("CreateTransactionService: received arguments", { args: this.args });
      const userId = this.args.userId;
      const purpose = this.args.purpose;
      const walletId = this.args.walletId;
      const amount = this.args.amount;
      const amountType = this.args.amountType;
      const lockWallet = this.args.lockWallet || true;
      let exchangeRate = this.args.exchangeRate;
      if (!exchangeRate) {
        const wallet = await this.context.sequelize.models.wallet.findOne({ where: { id: walletId, userId } });
        if (!wallet) {
          logger.error("CreateTransactionService: wallet not found", { userId, walletId });
          return this.addError("InvalidWalletIdErrorType");
        }
        const currency = await this.context.sequelize.models.currency.findOne({ where: { id: wallet.currencyId } })
        if (!currency) {
          logger.error('CreateTransactionService: currency not found', { userId, walletId })
          return this.addError('CurrencyNotFoundErrorType')
        }
        exchangeRate = currency.exchangeRate;
      }
      let fiatAmount = this.args.fiatAmount;
      if (!fiatAmount) {
        fiatAmount = convertCryptoToFiat(amount, exchangeRate)
      }
      const transaction = this?.args?.seqTransaction || this?.context?.sequelizeTransaction || await sequelize.transaction();
      logger.debug("CreateTransactionService: using transaction", { transactionId: transaction.id ? transaction.id : "N/A" });
      logger.info("CreateTransactionService: creating ledger", { userId, walletId, purpose, amount });
      const ledger = await CreateLedgerService.execute({
        amount,
        walletId,
        userId,
        purpose,
        amountType,
        fiatAmount,
        lockWallet,
        exchangeRate,
        seqTransaction: transaction
      });
      logger.debug("CreateTransactionService: ledger response", { ledger });
      if (_.size(ledger.errors)) {
        logger.error("CreateTransactionService: ledger returned errors", { errors: ledger.errors });
        return this.mergeErrors(ledger.errors);
      }
      const sequelizeType = this.context ? this.context.sequelize : sequelize;
      logger.info("CreateTransactionService: determined sequelize type", { sequelizeType });
      logger.info("CreateTransactionService: creating transaction record", { ledgerId: ledger.result.id, userId });
      const tx = await sequelizeType.models.transaction.create({
        ledgerId: ledger.result.id,
        userId,
        status: TRANSACTION_STATUS.COMPLETED,
        paymentId: this.args.paymentId,
        paymentProviderId: this.args.paymentProviderId,
        moreDetails: this.args.moreDetails
      }, { transaction });
      logger.debug("CreateTransactionService: transaction record created", { tx });
      tx.ledger = ledger.result;
      logger.info("CreateTransactionService: transaction service completed successfully", { txId: tx.id });
      return tx;
    } catch (error) {
      logger.error("CreateTransactionService: error occurred", { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
