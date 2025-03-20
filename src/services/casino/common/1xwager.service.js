import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { NumberPrecision } from '@src/libs/numberPrecision'
import ServiceBase from '@src/libs/serviceBase'
import { WAGER_STATUS } from '@src/utils/constants/public.constants.utils'
import { Op, Transaction } from 'sequelize'
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    betAmount: { type: 'string' },
    currencyId: { type: 'string' },
    seqTransaction: { type: ['object', 'array', 'null'] },
    userId: { type: 'string' },
    walletId: { type: 'string' },
  },
  required: ['userId', 'betAmount', 'walletId']
});

export class DepositWagerService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    const startTime = Date.now();
    const { betAmount, userId, walletId } = this.args;
    logger.info('Start(DepositWagerService):', { args: this.args });
    const transaction = this.context?.sequelizeTransaction;
    if (!transaction) {
      logger.error(`Transaction not found in context for DepositWagerService`);
      throw new APIError('Transaction not found in context for DepositWagerService');
    }

    try {
      const depositTransactions = await transaction.sequelize.models.transaction.findAll({
        where: {
          isWagerRequired: true,
          userId,
          wagerStatus: { [Op.in]: [WAGER_STATUS.NOT_STARTED, WAGER_STATUS.ONGOING] },
        },
        include: {
          attributes: ['amount', 'purpose', 'from_wallet_id', 'to_wallet_id', 'currencyId'],
          model: transaction.sequelize.models.ledger,
          required: true
        },
        order: [['id', 'ASC']],
        transaction
      })
      let wagerRemaining = Number(betAmount);
      if (wagerRemaining <= 0) {
        logger.info('Return(DepositWagerService): No wager');
        return { success: true };
      }

      for (const depositTransaction of depositTransactions) {
        const wagerableAmount = NumberPrecision.minus(depositTransaction.amountToWager, depositTransaction.wageredAmount);
        if (wagerableAmount > 0) {
          const wagerForThisTransaction = Math.min(wagerableAmount, wagerRemaining);
          wagerRemaining = NumberPrecision.minus(wagerRemaining, wagerForThisTransaction);

          // Update the transaction with the new wagered amount
          const wageredAmount = NumberPrecision.plus(depositTransaction.wageredAmount, wagerForThisTransaction);
          depositTransaction.wageredAmount = wageredAmount;
          depositTransaction.wagerStatus = WAGER_STATUS.ONGOING;
          if (wageredAmount >= depositTransaction.amountToWager) {
            depositTransaction.wagerStatus = WAGER_STATUS.COMPLETED;
            const newWagerableAmount = NumberPrecision.minus(depositTransaction.amountToWager, wageredAmount);
            const wallet = await transaction.sequelize.models.wallet.findOne({
              where: {
                id: walletId,
                userId
              },
              lock: Transaction.LOCK.UPDATE,
              transaction
            });
            wallet.withdrawableAmount = NumberPrecision.plus(wallet.withdrawableAmount, newWagerableAmount);
            wallet.amount = NumberPrecision.minus(wallet.amount, newWagerableAmount);
            await wallet.save({ transaction });
          }
          await depositTransaction.save({ transaction });
          if (wagerRemaining === 0)
            break;
        }
      }

      logger.info('Return(DepositWagerService)');
      return { success: true }
    } catch (error) {
      logger.error('UnknownError(DepositWagerService):', { message: error.message, stack: error.stack });
      throw new APIError(error)
    } finally {
      const elapsedTime = Date.now() - startTime;
      logger.info(`__Execution time for DepositWagerService: ${elapsedTime}ms`);
    }
  }
}
