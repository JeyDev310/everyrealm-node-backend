import { APIError } from '@src/errors/api.error';
import { convertCryptoToFiat, convertFiatToCrypto } from '@src/helpers/casino/softSwiss.helper';
import ajv from '@src/libs/ajv';
import { NumberPrecision } from '@src/libs/numberPrecision';
import ServiceBase from '@src/libs/serviceBase';
import { emitUserWallet } from '@src/socket-resources/emitters/wallet.emitter';
import { CASINO_TRANSACTION_STATUS } from '@src/utils/constants/casinoManagement.constants';
import { LEDGER_PURPOSE, LEDGER_RULES } from '@src/utils/constants/public.constants.utils';
import { logger } from '@src/utils/logger';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';

const constraints = ajv.compile({
  type: 'object',
  properties: {
    issue_id: { type: 'string' },
    status: { type: 'string' },
    total_amount: { type: 'number' },
    user_id: { type: 'string' },
    currency_id: { type: 'string' }
  },
  required: ['user_id', 'currency_id']
});

export class SoftSwissFreespinService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    logger.info('Start(SoftSwissFreespinService)');
    try {
      const transaction = this.context.sequelizeTransaction;
      let { issue_id: issueId, status, total_amount: totalAmount, user_id: userId, currency_id: currencyId } = this.args;
      logger.info('Info(SoftSwissFreespinService):', { issueId, status, totalAmount, userId, currencyId });
      let response = {};
      let wallet = {};

      // Fetch user using provided userId and currencyId
      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id', 'username', 'isActive'],
        where: {
          id: userId,
          isActive: true
        },
        include: {
          attributes: ['id', 'userId', 'amount'],
          model: this.context.sequelize.models.wallet,
          where: { currencyId },
          include: {
            attributes: ['id', 'exchangeRate'],
            where: { isActive: true },
            model: this.context.sequelize.models.currency,
            required: true
          },
          required: true,
          separate: true
        }
      });
      if (!user) {
        logger.error('InvalidUser(SoftSwissFreespinService)');
        return { statusCode: 101, message: 'Player is invalid.' };
      }

      wallet = await this.context.sequelize.models.wallet.findOne({
        where: {
          id: user?.wallets[0].id,
          userId: user?.id
        },
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      const exchangeRate = user.wallets[0].currency.exchangeRate;
      if (status === 'played') {
        totalAmount = +totalAmount;

        const amount = convertFiatToCrypto(totalAmount / 100, exchangeRate);
        await wallet
          .set({ withdrawableAmount: NumberPrecision.plus(wallet?.withdrawableAmount || 0, amount) })
          .save({ transaction });
        const casinoLedger = await this.context.sequelize.models.ledger.create(
          {
            amount,
            currencyId: wallet.currencyId,
            exchangeRate,
            fiatAmount: totalAmount / 100,
            purpose: LEDGER_PURPOSE.CASINO_FREESPIN_WIN,
            toWalletId: wallet.id,
            type: LEDGER_RULES[LEDGER_PURPOSE.CASINO_FREESPIN_WIN],
            userId: user?.id
          },
          { transaction }
        );
        await this.context.sequelize.models.casinoTransaction.create(
          {
            gameId: null,
            ledgerId: casinoLedger.id,
            roundId: issueId,
            status: CASINO_TRANSACTION_STATUS.COMPLETED,
            transactionId: uuid(),
            userId: user?.id
          },
          { transaction }
        );
        const fiatBalance = convertCryptoToFiat(
          NumberPrecision.plus(wallet?.amount || 0, wallet?.withdrawableAmount || 0),
          exchangeRate
        );
        response.balance = Math.round(fiatBalance * 100);
        emitUserWallet(user.id, wallet);
        await transaction.commit();
        logger.info('Return(SoftSwissFreespinService):', { ...response });
        return { statusCode: 200, ...response };
      }
    } catch (error) {
      logger.error('UnknownError(SoftSwissFreespinService):', { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
