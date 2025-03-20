import { APIError } from '@src/errors/api.error'
import { alignDatabaseDateFilter } from '@src/helpers/common.helper'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    userId: { type: 'string' },
    currencyId: { type: 'string', default: 'all' },
    purpose: { enum: Object.values(LEDGER_PURPOSE) },
    page: { type: 'number', default: 1, minimum: 1 },
    perPage: { type: 'string', default: 10 },
    transactionId: { type: 'string' }
  },
  required: ['userId']
})

export class GetTransactionService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const page = this.args.page
    let limit = this.args.perPage
    const endDate = this.args.endDate
    const startDate = this.args.startDate
    const purpose = this.args.purpose
    const currencyId = this.args.currencyId
    const transactionId = this.args.transactionId

    try {
      const where = { userId: this.args.userId }
      if (transactionId) where.id = transactionId
      const nestedWhere = { }
      if (currencyId !== 'all') {
        nestedWhere.currencyId = +currencyId
      }
      if (purpose) nestedWhere.purpose = purpose
      if (startDate || endDate) where.createdAt = alignDatabaseDateFilter(startDate, endDate)

      let transactionRows, transactionCount;
      let totalPages = 1;
      if (limit === 'all') {
        const { rows, count } = await this.context.sequelize.models.transaction.findAndCountAll({
          where,
          include: {
            model: this.context.sequelize.models.ledger,
            where: nestedWhere,
            required: true,
            include: {
              attributes: ['code'],
              model: this.context.sequelize.models.currency,
              required: true
            }
          },
          order: [['createdAt', 'DESC']],
        })
        transactionRows = rows;
        transactionCount = count;
      } else {
        limit = parseInt(limit)
        const { rows, count } = await this.context.sequelize.models.transaction.findAndCountAll({
          where,
          include: {
            model: this.context.sequelize.models.ledger,
            where: nestedWhere,
            required: true,
            include: {
              attributes: ['code'],
              model: this.context.sequelize.models.currency,
              required: true
            }
          },
          limit,
          order: [['createdAt', 'DESC']],
          offset: (this.args.page - 1) * limit
        })
        transactionRows = rows;
        transactionCount = count;
        totalPages = Math.ceil(transactionCount / limit)
      }

      return { transactions: transactionRows, totalPages, page }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
