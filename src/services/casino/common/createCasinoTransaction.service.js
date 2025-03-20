import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { CreateLedgerService } from '@src/services/ledger/createLedger.service'
import { emitCasinoTransaction } from '@src/socket-resources/emitters/transaction.emitter'
import { CASINO_TRANSACTION_STATUS } from '@src/utils/constants/casinoManagement.constants'
import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils'
import _ from 'lodash'
import { logger } from '@src/utils/logger'
import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    wallet: { type: 'object' },
    userId: { type: 'string' },
    amount: { type: 'number' },
    walletId: { type: 'string' },
    gameId: { type: 'string' },
    transactionId: { type: 'string' },
    purpose: { enum: Object.values(LEDGER_PURPOSE) },
    roundId: { type: 'string' },
    exchangeRate: { type: 'number' },
  },
  required: ['userId', 'transactionId', 'walletId', 'purpose', 'amount']
})

export class CreateCasinoTransactionService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const userId = this.args.userId
      const purpose = this.args.purpose
      const gameId = this.args.gameId
      const walletId = this.args.walletId
      const amount = this.args.amount
      const transactionId = this.args.transactionId
      const transaction = this.context.sequelizeTransaction
      const casinoTransaction = this.context.sequelize.models.casinoTransaction
      const roundId = this.args.roundId
      let exchangeRate = this.args.exchangeRate
      if (!exchangeRate) {
        const wallet = await this.context.sequelize.models.wallet.findOne({ where: { id: walletId, userId }, transaction })
        if (!wallet) {
          logger.error('CreateCasinoTransactionService: wallet not found', { userId, walletId })
          return this.addError('InvalidWalletIdErrorType')
        }
        const currency = await this.context.sequelize.models.currency.findOne({ where: { id: wallet.currencyId } })
        if (!currency) {
          logger.error('CreateCasinoTransactionService: currency not found', { userId, walletId })
          return this.addError('CurrencyNotFoundErrorType')
        }
        exchangeRate = currency.exchangeRate
      }
      const fiatAmount = convertCryptoToFiat(amount, exchangeRate)

      const { result, errors } = await CreateLedgerService.execute({
        amount,
        walletId,
        userId,
        purpose,
        fiatAmount,
        exchangeRate
      }, this.context)

      if (_.size(errors)) return this.mergeErrors(errors)
      const tx = await casinoTransaction.create({
        userId,
        ledgerId: result.id,
        gameId,
        transactionId,
        status: CASINO_TRANSACTION_STATUS.COMPLETED,
        roundId
      }, { transaction })

      tx.userBalance = result.userBalance
      emitCasinoTransaction(tx)
      return tx
    } catch (error) {
      logger.error(error)
      return this.addError('InternalServerErrorType')
    }
  }
}
