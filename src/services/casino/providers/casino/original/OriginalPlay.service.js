import { convertCryptoToFiat, convertFiatToCrypto } from '@src/helpers/casino/softSwiss.helper';
import { checkBetLimit, roundUpBalance } from '@src/helpers/common.helper';
import ajv from '@src/libs/ajv';
import { Cache, CacheStore } from '@src/libs/cache';
import { NumberPrecision } from '@src/libs/numberPrecision';
import ServiceBase from '@src/libs/serviceBase';
import { emitBetLimit } from '@src/socket-resources/emitters/betLimit.emitter';
import { emitReloadHistory } from '@src/socket-resources/emitters/reloadHistory.emitter';
import { emitUserWallet } from '@src/socket-resources/emitters/wallet.emitter';
import { CASINO_TRANSACTION_STATUS } from '@src/utils/constants/casinoManagement.constants';
import { LEDGER_PURPOSE, LEDGER_RULES } from '@src/utils/constants/public.constants.utils';
import _, { first } from 'lodash';
import { sequelize } from '@src/database'
import { Op } from 'sequelize';
import { WageringService } from '../softSwiss/wageringService.service';
import { logger } from '@src/utils/logger';


const constraints = ajv.compile({
  type: "object",
  properties: {
    data: { type: "array" },
  },
  required: ["data"] // all these fields are mandatory
});

export class OriginalPlayService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    try {
      logger.info('Start(OriginalPlayService)', { args: this.args });

      const transaction = this.context?.sequelizeTransaction
      if (!transaction) {
        logger.error('TransactionNotFound(OriginalPlayService)');
        return { statusCode: 500, message: 'Transaction not found in context.' };
      }


      const { data } = this.args;
      const originalBetCurrencies = {};
      const userData = {};
      const userIds = [];
      const results = {};
      let response = {};
      let transactions = [];

      for (const callbackData of data) {
        let { user_id: userIdWithCurrency, game: gameIdentifier, game_id: roundId, actions } = callbackData;
        const [userId, originalBetCurrencyCode] = userIdWithCurrency.split('_');
        let originalBetCurrencyId = originalBetCurrencies[originalBetCurrencyCode];

        if (!originalBetCurrencyId) {
          const originalBetCurrency = await this.context.sequelize.models.currency.findOne({
            attributes: ['id'],
            where: { code: originalBetCurrencyCode }, // Fixed variable name
            raw: true
          });

          if (!originalBetCurrency) {
            await transaction.rollback();
            logger.error('CurrencyNotFound(SoftSwissPlayService):', { currencyCode: originalBetCurrencyCode });
            return { statusCode: 500, message: 'Currency not found.' };
          }

          originalBetCurrencyId = originalBetCurrency.id;
          originalBetCurrencies[originalBetCurrencyCode] = originalBetCurrencyId;
        }

        userIds.push(userId);
        userData[userId] = {
          gameIdentifier,
          roundId,
          actions,
          originalBetCurrencyId
        }
      }

      // Fetch user
      const users = await this.context.sequelize.models.user.findAll({
        attributes: ['id', 'uniqueId', 'username', 'isActive', 'waggeredAmount'],
        where: { uniqueId: { [Op.in]: userIds }, isActive: true },
      });

      if (!users || users.length == 0) {
        logger.error('UserDisabled(OriginalPlayService)');
        return { statusCode: 110, message: 'Player is disabled.' };
      }

      for (const user of users) {

        let betStreamObj = {};


        const moreDetails = { amount: 0, withdrawableAmount: 0 };
        // fetch the user's wallet balance for the  originalBetCurrencyId
        const userWallet = await this.context.sequelize.models.wallet.findOne({
          attributes: ['id', 'amount', 'withdrawableAmount', 'currencyId'],
          where: { userId: user.id, currencyId: userData[user.uniqueId].originalBetCurrencyId },
          include: {
            attributes: ['id', 'exchangeRate', 'symbol', 'code'],
            where: { isActive: true },
            model: this.context.sequelize.models.currency,
            required: true,
          },
        });

        if (!userWallet || !userWallet.currency) {
          logger.error('WalletOrCurrencyNotFound(OriginalPlayService)');
          continue;
        }

        const checkGameExists = await this.context.sequelize.models.casinoGame.findOne({
          attributes: ['name', 'hasFreespins', 'moreDetails', 'featureGroup', 'volatilityRating', 'returnToPlayer', 'theme', 'lines', 'id', 'restrictedCountries'],
          where: { identifier: userData[user.uniqueId].gameIdentifier, isActive: true },
        });

        if (!checkGameExists) {
          logger.error('ForbiddenGame(SoftSwissPlayService)');
          continue;
        }

        let wagerArgs;
        const action = userData[user.uniqueId].actions[0];
        const purpose = action.action === 'bet' ? LEDGER_PURPOSE.CASINO_BET : LEDGER_PURPOSE.CASINO_WIN;
        let toWalletId = null;
        let fromWalletId = null;

        // Check if round exists
        const isRoundExist = await this.context.sequelize.models.casinoTransaction.findOne({
          where: { roundId: userData[user.uniqueId].roundId },
          include: [
            {
              attributes: ['exchangeRate'],
              model: this.context.sequelize.models.ledger,
              required: true,
            },
          ],
        });
        logger.info('Round check:', { roundStatus: isRoundExist ? 'Round exists' : 'Round does not exist' });

        const exchangeRate = isRoundExist?.ledger?.exchangeRate ?? userWallet?.currency?.exchangeRate;

        if (!exchangeRate) {
          logger.error('InvalidExchangeRate(OriginalPlayService):', { exchangeRate, currencyId: userWallet.currency?.id || 'Unknown' });
          continue;
        }

        logger.info('OriginalPlayService - Exchange rate:', { exchangeRate });

        if (!isRoundExist && (action.action_id === await Cache.get(CacheStore.redis, 'RollbackBetWinTransactionId_1') ||
          action.action_id === await Cache.get(CacheStore.redis, 'RollbackBetWinTransactionId_2'))) {
          logger.info('OriginalPlayService - Rollback transaction matched:', { action });
          logger.info('OriginalPlayService - Rollback transaction matched:', { action_id: action.action_id });

          transactions.push({
            action_id: action.action_id,
            tx_id: `${await Cache.get(CacheStore.redis, 'RollbackBetWinTransactionId_1')}`,
            processed_at: new Date(),
          });
          response.balance = Math.round(
            roundUpBalance(convertCryptoToFiat(userWallet.amount + userWallet.withdrawableAmount, exchangeRate)) * 100
          );
          continue;
        }

        if (action.action == "win" && !isRoundExist) {
          continue;
        }

        const amount = convertFiatToCrypto(roundUpBalance(action.amount / 100), exchangeRate);

        logger.info('OriginalPlayService - Action is:', { action: action.action });
        if (action.action === 'bet') {
          logger.info('OriginalPlayService - Processing BET action...');
          let remainingBetAmount = 0;
          if (isRoundExist?.transactionId === action.action_id) {
            logger.info('OriginalPlayService - Duplicate transaction:', { actionId: action.action_id });

            logger.info('OriginalPlayService - Pushing transaction with the following details:', {
              action_id: action.action_id,
              tx_id: isRoundExist.id,
              processed_at: isRoundExist.createdAt
            });

            transactions.push({
              action_id: action.action_id,
              tx_id: `${isRoundExist.id}`,
              processed_at: isRoundExist.createdAt,
            });
            response.balance = Math.round(
              roundUpBalance(convertCryptoToFiat(userWallet.amount + userWallet.withdrawableAmount, exchangeRate)) * 100
            );
            continue;
          }

          const limitExceed = await checkBetLimit(user.id, +action.amount / 100, this.context);
          logger.info('OriginalPlayService - Bet limit check:', { limitStatus: limitExceed ? 'Limit exceeded' : 'Within limit' });

          if (limitExceed) {
            logger.error('PlayerBetLimit(OriginalPlayService) - Player reached customized bet limit.');
            continue;
          }


          if (userWallet.amount + userWallet.withdrawableAmount < amount) {
            logger.error('OriginalPlayService - Insufficient funds for user:', { userId: user.id, walletBalance: userWallet.amount + userWallet.withdrawableAmount });
            logger.error('OriginalPlayService - Rolling back transaction due to insufficient funds.');
            await userWallet.reload();
            continue;
          }

          // Update wallet for bet
          logger.info('OriginalPlayService - Processing bet action for userWallet:', { userWalletId: userWallet.id });
          if (+userWallet.amount >= +amount) {
            await userWallet.update(
              { amount: NumberPrecision.minus(userWallet.amount, amount) },
              { transaction }
            );
            moreDetails.amount = +amount;
          } else {
            remainingBetAmount = NumberPrecision.minus(amount, userWallet.amount);
            moreDetails.amount = userWallet.amount;
            await userWallet.set({ amount: 0 }).save({ transaction });
            moreDetails.withdrawableAmount = remainingBetAmount;
            await userWallet.update(
              {
                amount: 0,
                withdrawableAmount: NumberPrecision.minus(userWallet.withdrawableAmount, remainingBetAmount)
              },
              { transaction }
            );
          }
          moreDetails.multiplier = action.multiplier;


          logger.info('OriginalPlayService - Calculating new wagered amount');

          const newWaggeredAmount = NumberPrecision.plus(user?.waggeredAmount || 0, +action.amount / 100);
          logger.info('OriginalPlayService - New Waggered Amount:', { newWaggeredAmount });

          await this.context.sequelize.models.user.update(
            { waggeredAmount: newWaggeredAmount },
            {
              where: { uniqueId: user.uniqueId },
              transaction
            }
          );

          logger.info('OriginalPlayService - User level upgraded for user:', { userId: user.id });
          wagerArgs = { userId: +user?.id, betAmount: +action.amount / 100, walletId: +userWallet.id, gameId: +checkGameExists.id, gameRtp: checkGameExists.returnToPlayer };
          fromWalletId = userWallet.id; // In case of bet, fromWalletId is the userWalletId

        } else if (action.action === 'win') {

          logger.info('OriginalPlayService - Processing win action for wallet:', { walletId: userWallet.id });
          moreDetails.multiplier = action.multiplier;
          toWalletId = userWallet.id; // In case of win, toWalletId is the userWalletId
          await userWallet
            .set({ withdrawableAmount: NumberPrecision.plus(userWallet.withdrawableAmount, amount) })
            .save({ transaction });

        }
        logger.info(`OriginalPlayService - Wallet updated after processing the ${action.action} action for user:`, { userId: user.id });

        // Create ledger and transaction
        logger.info('OriginalPlayService - Creating ledger and casino transaction');

        const casinoLedger = await this.context.sequelize.models.ledger.create(
          {
            userId: user?.id,
            purpose,
            toWalletId,
            fromWalletId,
            currencyId: userWallet.currency.id,
            amount,
            exchangeRate,
            fiatAmount: +action.amount / 100,
            type: LEDGER_RULES[purpose],
          },
          { transaction }
        );
        logger.info('OriginalPlayService - Ledger created:', { ledgerId: casinoLedger.id });
        logger.info('OriginalPlayService - Created casino ledger');

        if (!casinoLedger) {
          await transaction.rollback();
          logger.error('LedgerCreationFailed(OriginalPlayService)');
          continue;
        }


        // when reset, Softswiss sends us the same transactionId (has unique constraint) for further processing
        const [casinoTransaction, created] = await this.context.sequelize.models.casinoTransaction.findOrCreate({
          where: {
            transactionId: action.action_id, // Unique identifier for the transaction
          },
          defaults: {
            userId: user?.id,
            ledgerId: casinoLedger.id,
            gameId: checkGameExists.id,
            status: CASINO_TRANSACTION_STATUS.COMPLETED,
            roundId: userData[user.uniqueId].roundId,
            moreDetails,
          },
          transaction, // Use the same transaction context if required
        });

        logger.info('OriginalPlayService - Casino transaction created:', { casinoTransactionId: casinoTransaction.id });

        transactions.push({
          action_id: action.action_id,
          tx_id: `${casinoTransaction.id}`,
          processed_at: casinoTransaction.createdAt,
        });
        logger.info('OriginalPlayService - Transaction pushed:', { transactions });
        await userWallet.reload({ transaction });
        response.balance = Math.round(
          roundUpBalance(convertCryptoToFiat(userWallet.amount + userWallet.withdrawableAmount, exchangeRate)) * 100
        );

        if (action.action === "win") {
          const betLedger = await this.context.sequelize.models.casinoTransaction.findOne({
            where: {
              userId: user?.id
            },
            include: [{
              model: this.context.sequelize.models.ledger,
              attributes: ['purpose', 'amount', 'currency_id', 'from_wallet_id', 'to_wallet_id', 'fiat_amount', 'created_at'],
              where: {
                purpose: LEDGER_PURPOSE.CASINO_BET
              }
            }],
            order: [
              [{ model: this.context.sequelize.models.ledger }, 'created_at', 'desc']
            ],
            limit: 1,
            raw: true
          });

          betStreamObj = {
            tid: casinoTransaction.id,
            roundId: userData[user.uniqueId].roundId,
            username: user?.username,
            name: checkGameExists.name,
            symbol: userWallet.currency.symbol,
            code: userWallet.currency.code,
            bet: betLedger['ledger.amount'],
            betFiat: betLedger['ledger.fiat_amount'],
            purpose: LEDGER_PURPOSE.CASINO_BET,
            win: amount,
            winFiat: +action.amount / 100,
          }

        }


        response = { ...response, game_id: checkGameExists.id, transactions };

        results[user.uniqueId] = response;


        emitUserWallet(user.id, userWallet);
        logger.info('OriginalPlayService - Processing actions completed.');

        if (wagerArgs) {

          const wageringServicePayload = {
            currencyId: userData[user.uniqueId].originalBetCurrencyId,
            userId: user.id,
            gameId: checkGameExists.id,
            ...wagerArgs,
          }
          await WageringService.execute(wageringServicePayload, this.context);

        }

        await transaction.commit();

        logger.info('OriginalPlayService - Transaction committed successfully.');

        logger.info('OriginalPlayService - need to reload history.');

        await Cache.set(CacheStore.redis, `BetStream:${betStreamObj.tid}`, betStreamObj, 300);
        if (Object.keys(betStreamObj).length !== 0) {
          emitReloadHistory(betStreamObj);
        }

      }
      logger.info('Return(OriginalPlayService):', results);
      return { statusCode: 200, results };
    } catch (error) {
      logger.error('UnknownError(OriginalPlayService):', { message: error.message, stack: error.stack });
      return { statusCode: 500, message: 'Something went wrong' };
    }
  }

}
