import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { NumberPrecision } from '@src/libs/numberPrecision'
import ServiceBase from '@src/libs/serviceBase'
import { emitUserDeposit } from '@src/socket-resources/emitters/deposit.emitter'
import { emitUserWallet } from '@src/socket-resources/emitters/wallet.emitter'
import { LEDGER_PURPOSE, LEDGER_RULES, LEDGER_TYPES, TRANSACTION_STATUS, WAGER_STATUS } from '@src/utils/constants/public.constants.utils'
import { Transaction } from 'sequelize'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    paymentId: { type: 'string' },
    withdrawSpentId: { type: 'string' },
    fees: { type: 'string' },
    paymentProviderId: { type: 'number' },
    amount: { type: 'number' },
    walletId: { type: 'string' },
    exchangeRate: { type: 'string' },
    moreDetails: { type: 'object' },
    purpose: { enum: Object.values(LEDGER_PURPOSE) },
    status: { enum: Object.values(TRANSACTION_STATUS), default: TRANSACTION_STATUS.PENDING },
    fiatAmount: { type: 'number' },
    network : {type:'string'}
  },
  required: ['userId', 'walletId', 'purpose', 'amount']
})

export class CreatePaymentTransactionService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    try {
      const purpose = this.args.purpose
      const type = LEDGER_RULES[purpose]
      const amount = this.args.amount
      const userId = this.args.userId
      const walletId = this.args.walletId
      let fiatAmount = this.args.fiatAmount
      const network = this.args.network
      let exchangeRate = this.args.exchangeRate
      const transaction = this.context.sequelizeTransaction
      const WalletModel = this.context.sequelize.models.wallet
      let toWalletId = null
      let fromWalletId = null

      const wallet = await WalletModel.findOne({
        where: { id: walletId, userId },
        lock: Transaction.LOCK.UPDATE,
        transaction
      })

      if (!wallet) return this.addError('InvalidWalletIdErrorType')

      if (!exchangeRate) {
        const currency = await this.context.sequelize.models.currency.findOne({ where: { id: wallet.currencyId } })
        if (!currency) {
          logger.error('CreateCasinoTransactionService: currency not found', { userId, walletId })
          return this.addError('CurrencyNotFoundErrorType')
        }
        exchangeRate = currency.exchangeRate
      }

      if (!fiatAmount) {
        fiatAmount = convertCryptoToFiat(amount, exchangeRate)
      }

      if (type === LEDGER_TYPES.DEBIT) {
        fromWalletId = wallet.id
        wallet.withdrawableAmount = NumberPrecision.minus(wallet.withdrawableAmount, amount)
      } else if (type === LEDGER_TYPES.CREDIT && this.args.status === TRANSACTION_STATUS.COMPLETED) {
        wallet.amount = NumberPrecision.plus(wallet.amount, amount)
        toWalletId = wallet.id
      }
      await wallet.save({ transaction })
      const ledger = await this.context.sequelize.models.ledger.create({
        type,
        userId,
        purpose,
        toWalletId,
        fromWalletId,
        currencyId: wallet.currencyId,
        amount,
        fiatAmount,
        exchangeRate
      }, { transaction })

      await this.context.sequelize.models.transaction.create({
        ledgerId: ledger.id,
        userId,
        status: this.args.status,
        paymentId: this.args.paymentId,
        paymentProviderId: this.args.paymentProviderId,
        withdrawSpentId: this.args.withdrawSpentId,
        fees: this.args.fees,
        moreDetails: this.args.moreDetails,
        amountToWager: fiatAmount,
        wageredAmount: 0,
        isWagerRequired: type === LEDGER_TYPES.CREDIT ? true : false,
        wagerStatus: type === LEDGER_TYPES.CREDIT ? WAGER_STATUS.NOT_STARTED : null
      }, { transaction })

      if(network) ledger.network = network

      if(this.args.status !== TRANSACTION_STATUS.FAILED) {
        emitUserWallet(wallet.userId, wallet)
        emitUserDeposit(wallet.userId, ledger)
      }

      return ledger
    } catch (error) {
      throw new APIError(error)
    }
  }
}
