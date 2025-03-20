import { APIError } from '@src/errors/api.error';
import { convertCryptoToFiat, convertFiatToCrypto } from '@src/helpers/casino/softSwiss.helper';
import { checkBetLimit, roundUpBalance } from '@src/helpers/common.helper';
import ajv from '@src/libs/ajv';
import { Cache, CacheStore } from '@src/libs/cache';
import { NumberPrecision } from '@src/libs/numberPrecision';
import ServiceBase from '@src/libs/serviceBase';
import { emitReloadHistory } from '@src/socket-resources/emitters/reloadHistory.emitter';
import { emitUserWallet } from '@src/socket-resources/emitters/wallet.emitter';
import { CASINO_TRANSACTION_STATUS } from '@src/utils/constants/casinoManagement.constants';
import { LEDGER_PURPOSE, LEDGER_RULES } from '@src/utils/constants/public.constants.utils';
import { logger } from '@src/utils/logger';
import { WageringService } from './wageringService.service';

const constraints = ajv.compile({
  type: 'object',
  properties: {
    actions: { type: 'array' },
    currency: { type: 'string' },
    finished: { type: 'boolean' },
    game_id: { type: 'string' },
    game: { type: 'string' },
    user_id: { type: 'string' },
  },
  required: ['game', 'user_id', 'currency'],
});

export class SoftSwissPlayService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { actions, game: gameIdentifier, game_id: roundId, user_id } = this.args;
    logger.info('Start(SoftSwissPlayService):', { actions, gameIdentifier, roundId, user_id });

    const transaction = this.context?.sequelizeTransaction;
    if (!transaction) {
      logger.error('TransactionNotFound(SoftSwissPlayService)');
      return { statusCode: 500, message: 'Transaction not found in context.' };
    }

    try {
      const userId = user_id.split('_')[0];
      const originalBetCurrencyCode = user_id.split('_')[1]; // this will give something like BTC, ETC etc
      const originalBetCurrency = await this.context.sequelize.models.currency.findOne({
        attributes: ['id'],
        where: { code: originalBetCurrencyCode },
        raw: true
      });

      if (!originalBetCurrency) {
        await transaction.rollback();
        logger.error('CurrencyNotFound(SoftSwissPlayService):', { currencyCode: originalBetCurrencyCode });
        return { statusCode: 500, message: 'Currency not found.' };
      }
      const originalBetCurrencyId = originalBetCurrency.id;

      let response = {};
      let transactions = [];
      const moreDetails = { amount: 0, withdrawableAmount: 0 };

      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id', 'username', 'isActive', 'waggeredAmount'],
        where: {
          uniqueId: userId,
          isActive: true
        },
      });
      if (!user) {
        await transaction.rollback();
        logger.error('UserDisabled(SoftSwissPlayService)');
        return { statusCode: 110, message: 'Player is disabled.' };
      }

      const userWallet = await this.context.sequelize.models.wallet.findOne({
        attributes: ['id', 'amount', 'withdrawableAmount', 'currencyId'],
        where: { userId: user.id, currencyId: originalBetCurrencyId },
        include: {
          attributes: ['id', 'exchangeRate', 'symbol', 'code'],
          where: { isActive: true },
          model: this.context.sequelize.models.currency,
          required: true,
        },
      });
      if (!userWallet || !userWallet.currency) {
        await transaction.rollback();
        logger.error('WalletOrCurrencyNotFound(SoftSwissPlayService)');
        return { statusCode: 500, message: 'Player wallet or currency not found.' };
      }

      logger.info('Info(SoftSwissPlayService) - User wallet fetched:', { userWallet });
      if (!actions) {
        const fiatBalance = convertCryptoToFiat(userWallet.amount + userWallet.withdrawableAmount, userWallet.currency.exchangeRate);
        response = { balance: Math.round(roundUpBalance(fiatBalance) * 100) };
        await transaction.commit();
        logger.info('Return(SoftSwissPlayService): No action -', { userBalance: response.balance });
        return { statusCode: 200, ...response };
      }

      const checkGameExists = await this.context.sequelize.models.casinoGame.findOne({
        attributes: ['name', 'hasFreespins', 'moreDetails', 'featureGroup', 'volatilityRating', 'returnToPlayer', 'theme', 'lines', 'id', 'restrictedCountries'],
        where: { identifier: gameIdentifier, isActive: true },
      });
      if (!checkGameExists) {
        await transaction.rollback();
        logger.error('ForbiddenGame(SoftSwissPlayService)');
        return { statusCode: 107, message: 'Game is forbidden to the player.' };
      }

      let betStreamObj = {};
      let wagerArgs;
      let betAmount = 0, betFiatAmount = 0, winAmount = 0, winFiatAmount = 0;
      for (const action of actions) {
        const purpose = action.action === 'bet' ? LEDGER_PURPOSE.CASINO_BET : LEDGER_PURPOSE.CASINO_WIN;
        let toWalletId = null;
        let fromWalletId = null;
        const isRoundExist = await this.context.sequelize.models.casinoTransaction.findOne({
          where: { roundId },
          include: [{
            attributes: ['exchangeRate'],
            model: this.context.sequelize.models.ledger,
            required: true,
          }],
        });

        logger.info('Info(SoftSwissPlayService) - Round check:', { roundStatus: isRoundExist ? 'Round exists' : 'Round does not exist' });
        const exchangeRate = isRoundExist?.ledger?.exchangeRate ?? userWallet?.currency?.exchangeRate;
        if (!exchangeRate) {
          await transaction.rollback();
          logger.error('InvalidExchangeRate(SoftSwissPlayService):', { exchangeRate, currencyId: userWallet.currency?.id || 'Unknown' });
          return { statusCode: 500, message: 'Invalid exchange rate.' };
        }

        if (!isRoundExist && (action.action_id === await Cache.get(CacheStore.redis, 'RollbackBetWinTransactionId_1') ||
          action.action_id === await Cache.get(CacheStore.redis, 'RollbackBetWinTransactionId_2'))) {
          logger.info('Info(SoftswissPlayService) - Rollback transaction matched:', { action });
          logger.info('Info(SoftswissPlayService) - Rollback transaction matched:', { action_id: action.action_id });

          transactions.push({
            action_id: action.action_id,
            tx_id: `${await Cache.get(CacheStore.redis, 'RollbackBetWinTransactionId_1')}`,
            processed_at: new Date(),
          });
          const fiatBalance = convertCryptoToFiat(userWallet.amount + userWallet.withdrawableAmount, exchangeRate);
          response.balance = Math.round(roundUpBalance(fiatBalance) * 100);
          continue;
        }

        const amount = convertFiatToCrypto(roundUpBalance(action.amount / 100), exchangeRate);
        if (action.action === 'bet') {
          let remainingBetAmount = 0;
          if (isRoundExist?.transactionId === action.action_id) {
            transactions.push({
              action_id: action.action_id,
              tx_id: `${isRoundExist.id}`,
              processed_at: isRoundExist.createdAt,
            });
            const fiatBalance = convertCryptoToFiat(userWallet.amount + userWallet.withdrawableAmount, exchangeRate);
            response.balance = Math.round(roundUpBalance(fiatBalance) * 100);
            continue;
          }


          const limitExceed = await checkBetLimit(user.id, +action.amount / 100, this.context);
          if (limitExceed) {
            await transaction.rollback();
            logger.error('CustomizedPlayerBetLimit(SoftSwissPlayService)');
            return { statusCode: 105, message: 'Player reached customized bet limit.' };
          }
          logger.info('Info(SoftswissPlayService) - Bet limit check:', { limitStatus: 'Within limit' });

          if (userWallet.amount + userWallet.withdrawableAmount < amount) {
            await transaction.rollback();
            await userWallet.reload();
            const balance = convertCryptoToFiat(userWallet.amount + userWallet.withdrawableAmount, userWallet.currency.exchangeRate);
            logger.error('InsufficientFunds(SoftSwissPlayService)');
            return {
              statusCode: 100,
              message: 'Player has not enough funds to process an action.',
              balance: Math.round(roundUpBalance(balance) * 100),
            };
          }

          if (+userWallet.amount >= +amount) {
            await userWallet.update(
              { amount: NumberPrecision.minus(userWallet.amount, amount) },
              { transaction }
            );
            moreDetails.amount = +amount;
          } else {
            remainingBetAmount = NumberPrecision.minus(amount, userWallet.amount);
            moreDetails.amount = userWallet.amount;
            await userWallet.update({
              amount: 0,
              withdrawableAmount: NumberPrecision.minus(userWallet.withdrawableAmount, remainingBetAmount)
            }, { transaction });
          }

          logger.info('Info(SoftswissPlayService) - Calculating new wagered amount');
          const newWaggeredAmount = NumberPrecision.plus(user?.waggeredAmount || 0, +action.amount / 100);
          logger.info('Info(SoftswissPlayService) - New Waggered Amount:', { newWaggeredAmount });

          await this.context.sequelize.models.user.update(
            { waggeredAmount: newWaggeredAmount },
            {
              where: { uniqueId: userId },
              transaction
            },
          );

          wagerArgs = {
            betAmount: +action.amount / 100,
            currencyId: userWallet.currency.id,
            gameId: +checkGameExists.id,
            gameRtp: checkGameExists.returnToPlayer,
            userId: +user?.id,
            walletId: +userWallet.id,
          };
          betAmount = amount;
          betFiatAmount = +action.amount / 100;
          fromWalletId = userWallet.id; // For bet actions, fromWalletId is the userWalletId
        } else if (action.action === 'win') {
          toWalletId = userWallet.id; // For win actions, toWalletId is the userWalletId
          moreDetails.amount = 0;
          moreDetails.withdrawableAmount = amount;
          await userWallet.update(
            { withdrawableAmount: NumberPrecision.plus(userWallet.withdrawableAmount, amount) },
            { transaction }
          );
          winAmount = amount;
          winFiatAmount = action.amount / 100;
        }
        logger.info(`Info(SoftswissPlayService) - Wallet updated after processing the ${action.action} action for user:`, { userId: user.id });

        // Create ledger and transaction
        logger.info('Info(SoftswissPlayService) - Creating casino ledger and transaction:', {
          amount,
          currencyId: userWallet.currency.id,
          exchangeRate,
          fiatAmount: +action.amount / 100,
          fromWalletId,
          purpose,
          toWalletId,
          type: LEDGER_RULES[purpose],
          userId: user?.id,
        });

        const casinoLedger = await this.context.sequelize.models.ledger.create({
          amount,
          currencyId: userWallet.currency.id,
          exchangeRate,
          fiatAmount: +action.amount / 100,
          fromWalletId,
          purpose,
          toWalletId,
          type: LEDGER_RULES[purpose],
          userId: user?.id,
        }, { transaction });
        logger.info('Info(SoftswissPlayService) - Ledger created:', { ledgerId: casinoLedger.id });
        logger.info('Info(SoftswissPlayService) - Created casino ledger');

        if (!casinoLedger) {
          await transaction.rollback();
          logger.error('LedgerCreationFailed(SoftSwissPlayService)');
          return { statusCode: 500, message: 'Ledger creation failed.' };
        }

        logger.info('Info(SoftswissPlayService) - Creating casino transaction:', {
          transactionId: action.action_id,
          gameId: checkGameExists.id,
          ledgerId: casinoLedger.id,
          moreDetails,
          roundId,
          status: CASINO_TRANSACTION_STATUS.COMPLETED,
          userId: user?.id,
        });

        const [casinoTransaction, _created] = await this.context.sequelize.models.casinoTransaction.findOrCreate({
          where: { transactionId: action.action_id },
          defaults: {
            gameId: checkGameExists.id,
            ledgerId: casinoLedger.id,
            moreDetails,
            roundId,
            status: CASINO_TRANSACTION_STATUS.COMPLETED,
            userId: user?.id,
          },
          transaction,
        });

        if (!casinoTransaction) {
          logger.error('CasinoTransactionCreationFailed(SoftSwissPlayService)');
          await transaction.rollback();
          return { statusCode: 500, message: 'Casino transaction creation failed.' };
        }
        logger.info('Info(SoftswissPlayService) - Casino transaction created:', { casinoTransactionId: casinoTransaction.id });

        transactions.push({
          action_id: action.action_id,
          processed_at: casinoTransaction.createdAt,
          tx_id: `${casinoTransaction.id}`,
        });
        await userWallet.reload({ transaction });
        response.balance = Math.round(
          roundUpBalance(convertCryptoToFiat(userWallet.amount + userWallet.withdrawableAmount, exchangeRate)) * 100
        );

        betStreamObj = {
          tid: casinoTransaction.id,
          roundId,
          username: user?.username,
          name: checkGameExists.name,
          symbol: userWallet.currency.symbol,
          code: userWallet.currency.code,
          bet: betAmount,
          betFiat: betFiatAmount,
          purpose: LEDGER_PURPOSE.CASINO_BET,
          win: winAmount,
          winFiat: winFiatAmount,
        };
      }
      response = { ...response, game_id: checkGameExists.id, transactions };

      // Emit wallet update before committing
      emitUserWallet(user.id, userWallet);

      logger.info('Info(SoftswissPlayService) - Processing actions completed.');

      if (wagerArgs) {
        const wageringServicePayload = {
          currencyId: originalBetCurrencyId,
          userId: userId,
          gameId: checkGameExists.id,
          ...wagerArgs,
        };
        await WageringService.execute(wageringServicePayload, this.context);
      }

      await transaction.commit();
      await Cache.set(CacheStore.redis, `BetStream:${betStreamObj.tid}`, betStreamObj, 300);
      if (Object.keys(betStreamObj).length !== 0) {
        emitReloadHistory(betStreamObj);
      }

      logger.info('Info(SoftswissPlayService) - need to reload history.');
      logger.info('Info(SoftswissPlayService) - Transaction committed successfully.');
      logger.info('Info(SoftswissPlayService) - Wager args:', { wagerArgs });

      logger.info('Return(SoftSwissPlayService):', { statusCode: 200, ...response });
      return { statusCode: 200, ...response };
    } catch (error) {
      logger.error('UnknownError(SoftSwissPlayService):', { message: error.message, stack: error.stack });
      if (!transaction.finished) {
        logger.error('SOFTSWISS PLAY SERVICE CONTROLLER ROLLBACK:', { message: error.message, stack: error.stack });
        await transaction.rollback();
      }
      throw new APIError(error);
    }
  }
}
