import ajv from '@src/libs/ajv'
import { NumberPrecision } from '@src/libs/numberPrecision'
import ServiceBase from '@src/libs/serviceBase'
import { CreateCasinoTransactionService } from '@src/services/casino/common/createCasinoTransaction.service'
import { DIRECTION, casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'
import { LEDGER_PURPOSE, LEDGER_RULES } from '@src/utils/constants/public.constants.utils'
import _ from 'lodash'
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    walletId: { type: 'string' },
    gameId: { type: 'string' },
    direction: { enum: Object.values(DIRECTION), default: DIRECTION.CREDIT },
    transactionId: { type: 'string' },
    amount: { type: 'string' },
    extraData: { type: ['string', 'object'] },
    eventId: { type: 'string' },
    time: { type: 'string' },
    eventType: { type: 'string' },
    tournamentId: { type: 'string' }
  },
  required: ['userId', 'walletId', 'gameId', 'direction', 'transactionId', 'amount']
})

export class CasinoMoveFundsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { direction, gameId, transactionId, amount } = this.args
    const transaction = this.context.sequelizeTransaction

    try {
      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id'],
        where: { id: this.args.userId },
        transaction
      })

      if (!user) return casinoErrorTypes.USER_NOT_FOUND

      const responseObject = {}
      const tx = await this.context.sequelize.models.casinoTransaction.findOne({ where: { transactionId }, transaction })
      if (tx) return casinoErrorTypes.TRANSACTION_ALREADY_EXISTS

      const purpose = direction === 'debit' ? LEDGER_PURPOSE.CASINO_BET : LEDGER_PURPOSE.CASINO_WIN
      const casinoGameId = (await this.context.models.casinoGame.findOne({ where: { uniqueId: gameId }, attributes: ['id'] })).id

      const { result, errors } = await CreateCasinoTransactionService.execute({
        userId: this.args.userId,
        walletId: this.args.walletId,
        purpose: purpose,
        gameId: casinoGameId,
        type: LEDGER_RULES[purpose],
        amount: +amount,
        transactionId
      }, this.context)
      if (_.size(errors)) return this.mergeErrors(errors)

      responseObject.balance = NumberPrecision.round(result.userBalance)
      responseObject.status = true
      responseObject.statusCode = 200
      return responseObject
    } catch (error) {
      logger.error( { message: error.message, stack: error.stack })
      await transaction.rollback()
      return casinoErrorTypes.UNKNOWN_ERROR
    }
  }
}
