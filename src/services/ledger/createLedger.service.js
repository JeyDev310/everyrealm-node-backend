import { sequelize } from '@src/database';
import { APIError } from "@src/errors/api.error";
import ajv from "@src/libs/ajv";
import { NumberPrecision } from "@src/libs/numberPrecision";
import ServiceBase from "@src/libs/serviceBase";
import { emitUserWallet } from "@src/socket-resources/emitters/wallet.emitter";
import { AMOUNT_TYPES, LEDGER_PURPOSE, LEDGER_RULES, LEDGER_TYPES } from "@src/utils/constants/public.constants.utils";
import { logger } from "@src/utils/logger";
import { Transaction } from "sequelize";

const constraints = ajv.compile({
  type: "object",
  properties: {
    amount: { type: "number" },
    amountType: { default: AMOUNT_TYPES.CASH, enum: Object.values(AMOUNT_TYPES) },
    exchangeRate: { type: "string" },
    fiatAmount: { type: "number" },
    lockWallet: { type: "boolean" },
    purpose: { enum: Object.values(LEDGER_PURPOSE) },
    seqTransaction: { type: ['object', 'array', 'null'] },
    userId: { type: "string" },
    walletId: { type: "string" },
  },
  required: ["userId", "walletId", "purpose", "amount"],
});

export class CreateLedgerService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { amount, amountType, exchangeRate, fiatAmount, lockWallet, purpose, seqTransaction, userId, walletId } = this.args;
    logger.info('Start(CreateLedgerService):', { amount, amountType, exchangeRate, fiatAmount, lockWallet, purpose, seqTransaction, userId, walletId });
    const isWalletLocked = lockWallet || true;
    try {
      const type = LEDGER_RULES[purpose];
      logger.debug('CreateLedgerService: ledger type determined', { type });
      const transaction = seqTransaction || this?.context?.sequelizeTransaction || await sequelize.transaction();
      logger.debug('CreateLedgerService: using transaction', { transactionId: transaction.id ? transaction.id : "N/A" });
      const WalletModel = this?.context?.sequelize?.models?.wallet || sequelize.models.wallet;
      const LedgerModel = this?.context?.sequelize?.models?.ledger || sequelize.models.ledger;
      logger.info('CreateLedgerService: fetching wallet', { walletId, userId });
      const ledgerData = {
        exchangeRate: exchangeRate || 1,
        fiatAmount,
        purpose,
        userId,
      };

      const query = {
        transaction,
        where: { id: walletId, userId },
      };
      if (isWalletLocked) {
        query.lock = Transaction.LOCK.UPDATE;
      }
      const wallet = await WalletModel.findOne(query);
      logger.debug('CreateLedgerService: wallet fetch result', { walletFound: !!wallet });

      // Use the regular cash amount field
      const amountField = "amount";
      logger.info('CreateLedgerService: determined amount field', { amountField });
      if (!wallet) {
        logger.info('InvalidWallet(CreateLedgerService)');
        return this.addError("InvalidWalletIdErrorType");
      }

      ledgerData.currencyId = wallet.currencyId;
      if (type === LEDGER_TYPES.CREDIT) {
        ledgerData.toWalletId = wallet.id;
        wallet[amountField] = NumberPrecision.plus(wallet[amountField], amount);
        ledgerData.amount = amount;
      } else if (type === LEDGER_TYPES.DEBIT) {
        ledgerData.fromWalletId = wallet.id;
        if (amount > wallet[amountField]) {
          logger.info('InsufficiantAmount(CreateLedgerService)');
          return this.addError("NotEnoughAmountErrorType");
        }
        wallet[amountField] = NumberPrecision.minus(wallet[amountField], amount);
        ledgerData.amount = amount;
      }
      logger.info('CreateLedgerService: creating ledger record', { ledgerData });
      const ledger = await LedgerModel.create(ledgerData, { transaction });
      logger.debug('CreateLedgerService: ledger record created', { ledger });
      await wallet.save({ transaction });
      logger.info('CreateLedgerService: wallet saved successfully', { walletId: wallet.id });
      emitUserWallet(wallet.userId, wallet);
      ledger.wallet = wallet;
      ledger.userBalance = wallet[amountField];
      logger.info('Return(CreateLedgerService):', { ledger });
      return ledger;
    } catch (error) {
      logger.error('UnknownError(CreateLedgerService):', { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
