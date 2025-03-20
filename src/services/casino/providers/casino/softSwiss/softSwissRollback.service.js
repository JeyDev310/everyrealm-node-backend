import ajv from '@src/libs/ajv'
import { NumberPrecision } from '@src/libs/numberPrecision'
import ServiceBase from '@src/libs/serviceBase'
import { CASINO_TRANSACTION_STATUS } from '@src/utils/constants/casinoManagement.constants'
import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils'
import _ from 'lodash'
import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper'
import { emitUserWallet } from '@src/socket-resources/emitters/wallet.emitter'
import { roundUpBalance } from '@src/helpers/common.helper'
import { Cache, CacheStore } from '@src/libs/cache'
import { APIError } from '@src/errors/api.error'
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
    type: 'object',
    properties: {
        game: { type: 'string' },
        actions: { type: 'array' },
        user_id: { type: 'string' },
        game_id: { type: 'string' },
        currency: { type: 'string' },
        finished: { type: 'boolean' }
    },
    required: ['game', 'user_id', 'currency']
})

export class SoftSwissRollbackService extends ServiceBase {
    get constraints() {
        return constraints
    }

    async run() {
        try {
            logger.info('Rollback Service Args:', { args: this.args });

            const transaction = this.context.sequelizeTransaction
            let { user_id: userId, game, game_id: gameId, actions } = this.args
            userId = userId.split('_')[0]
            let response = {}
            let wallet = {}
            let transactions = []
            logger.info('Extracted User ID:', { userId });
            const user = await this.context.sequelize.models.user.findOne({
                attributes: ['id', 'username', 'isActive'],
                where: { uniqueId: userId },
            })
            logger.info('Fetched User:', { user });
            if (!user) {
                return { statusCode: 110, message: 'Player is disabled.' }
            }
            const currencyData = await this.context.sequelize.models.currency.findOne({
                attributes: ['id', 'exchangeRate'],
                where: { code: this.args.user_id.split('_')[1] }
            })
            logger.info('Currency Data:', { currencyData });
            const checkGameExists = await this.context.sequelize.models.casinoGame.findOne({
                attributes: ['name', 'hasFreespins', 'moreDetails', 'featureGroup', 'volatilityRating', 'returnToPlayer', 'theme', 'lines', 'id', 'restrictedCountries'],
                where: { identifier: gameId }
            })
            logger.info('Game Data:', { checkGameExists });
            if (actions) {
                let purpose = null
                wallet = await this.context.sequelize.models.wallet.findOne({
                    where: { currencyId: currencyData.id, userId: user?.id },
                    lock: transaction.LOCK.UPDATE,
                    transaction
                })
                logger.info('Wallet Data:', { wallet });
                let counter = 0
                for (const action of actions) {
                    counter = counter + 1
                    logger.info('Processing Action:', { counter, action });
                    if (action.action === 'rollback') {
                        let toWalletId = null
                        let fromWalletId = null
                        const isTransactionExist = await this.context.sequelize.models.casinoTransaction.findOne({
                            where: { transactionId: action.original_action_id },
                            transaction,
                            include: [{
                                attributes: ['exchangeRate', 'amount', 'fiatAmount', 'purpose'],
                                model: this.context.sequelize.models.ledger,
                                required: true
                            }]
                        })

                        logger.info('Transaction Exists:', { isTransactionExist });
                        if (!isTransactionExist) {
                            await Cache.set(CacheStore.redis, 'RollbackBetWinTransactionId_' + counter, action.original_action_id)
                            logger.info('Set Cache for Missing Transaction:', { transactionId: action.original_action_id });
                            transactions.push({
                                action_id: action.action_id,
                                tx_id: action.original_action_id,
                                processed_at: new Date()
                            })
                            response.balance = Math.round(roundUpBalance(convertCryptoToFiat(wallet.amount, currencyData.exchangeRate) + convertCryptoToFiat(wallet.withdrawableAmount, currencyData.exchangeRate)) * 100)
                            continue
                        }
                        if (isTransactionExist?.ledger.purpose === LEDGER_PURPOSE.CASINO_BET) {
                            fromWalletId = wallet.id
                            purpose = LEDGER_PURPOSE.CASINO_REFUND
                            logger.info('Bet Refund Purpose:', { purpose });
                            logger.info('Bet Refund Wallet ID:', { fromWalletId });
                            logger.info('Wallet Before Bet Refund:', { wallet });
                            logger.info('Bet Refund Amount:', { amount: isTransactionExist.moreDetails.amount });
                            logger.info('Bet Refund Withdrawable Amount:', { withdrawableAmount: isTransactionExist.moreDetails.withdrawableAmount });
                            logger.info('Total Wallet Amount Before Processing the Refund:', { total: wallet.amount + wallet.withdrawableAmount });
                            await wallet.set({ amount: NumberPrecision.plus(wallet.amount, isTransactionExist.moreDetails.amount) }).save({ transaction })
                            await wallet.set({ withdrawableAmount: NumberPrecision.plus(wallet.withdrawableAmount, isTransactionExist.moreDetails.withdrawableAmount) }).save({ transaction })
                        } else if (isTransactionExist?.ledger.purpose === LEDGER_PURPOSE.CASINO_WIN) {
                            toWalletId = wallet.id
                            purpose = LEDGER_PURPOSE.CASINO_REFUND
                            if (wallet.amount < isTransactionExist.moreDetails.amount) {
                                await wallet.set({ amount: NumberPrecision.minus(wallet.amount, wallet.amount) }).save({ transaction })
                                transactions.push({
                                    action_id: action.action_id,
                                    tx_id: action.original_action_id,
                                    processed_at: new Date()
                                })
                                response.balance = Math.round(roundUpBalance(convertCryptoToFiat(wallet.amount, currencyData.exchangeRate)) * 100)
                                continue
                            }
                            await wallet.set({ withdrawableAmount: NumberPrecision.minus(wallet.withdrawableAmount, isTransactionExist.ledger.amount) }).save({ transaction })
                        }
                        const casinoLedger = await this.context.sequelize.models.ledger.create({
                            userId: user?.id,
                            purpose,
                            toWalletId,
                            fromWalletId,
                            currencyId: wallet.currencyId,
                            amount: isTransactionExist.ledger.amount,
                            exchangeRate: isTransactionExist.ledger.exchangeRate,
                            fiatAmount: isTransactionExist.ledger.fiatAmount
                        }, { transaction })
                        logger.info('Created Ledger:', { casinoLedger });
                        const casinotransaction = await this.context.sequelize.models.casinoTransaction.create({
                            userId: user?.id,
                            ledgerId: casinoLedger.id,
                            gameId: isTransactionExist.gameId,
                            transactionId: action.action_id,
                            status: CASINO_TRANSACTION_STATUS.COMPLETED,
                            roundId: isTransactionExist.roundId
                        }, { transaction })
                        logger.info('Created Casino Transaction:', { casinotransaction });
                        transactions.push({
                            action_id: action.action_id,
                            tx_id: `${casinotransaction.id}`,
                            processed_at: casinotransaction.createdAt
                        })
                        response.balance = Math.round(roundUpBalance(convertCryptoToFiat(wallet.amount, currencyData.exchangeRate) + convertCryptoToFiat(wallet.withdrawableAmount, currencyData.exchangeRate)) * 100)
                    }
                }
            }
            response = { ...response, game_id: gameId.id, transactions }
            logger.info('Final Response:', { response });
            emitUserWallet(user.id, wallet)
            await transaction.commit()
            return { statusCode: 200, ...response }
        } catch (error) {
          logger.error('Soft Swiss Rollback Service Error:',   { message: error.message, stack: error.stack } );
            throw new APIError(error);
        }
    }
}
