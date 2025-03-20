import { APIError } from '@src/errors/api.error'
import { alignDatabaseDateFilter } from '@src/helpers/common.helper'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils'
import { sequelize } from '@src/database'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    currencyId: { type: 'string', default: '1' },
    purpose: { enum: Object.values(LEDGER_PURPOSE) },
    userId: { type: 'string' },
    transactionId: { type: 'string' },
    startDate: { type: 'string' },
    endDate: { type: 'string' },
    pageNo: { type: 'number', minimum: 1, default: 1 },
    limit: { type: 'number', minimum: 10, default: 10 }
  },
  required: ['userId']
})

export class GetCasinoTransactionService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const limit = this.args.limit
    const pageNo = this.args.pageNo
    const userId = this.args.userId
    const offset = (pageNo - 1) * limit;

    try {

      const getUserCasinoTransaction = await sequelize.query(
          `SELECT
           ct.round_id as "roundId", ct.user_id as "userId", l.currency_id as "currencyId", cg.id as "gameId", cg.name as "gameName", u.username, c.code as "currencyCode",
           SUM(CASE WHEN l.purpose = '${LEDGER_PURPOSE.CASINO_BET}' THEN l.amount ELSE 0 END) AS betamount,
           SUM(CASE WHEN l.purpose = '${LEDGER_PURPOSE.CASINO_WIN}' THEN l.amount ELSE 0 END) AS winamount,
           SUM(CASE WHEN l.purpose = '${LEDGER_PURPOSE.CASINO_BET}' THEN l.fiat_amount ELSE 0 END) AS betfiatamount,
           SUM(CASE WHEN l.purpose = '${LEDGER_PURPOSE.CASINO_WIN}' THEN l.fiat_amount ELSE 0 END) AS winfiatamount,
           MAX(ct.created_at) AS latest_created_at
           FROM
           public.casino_transactions AS ct
           JOIN ledgers AS l ON ct.ledger_id = l.id
           JOIN casino_games as cg on ct.game_id = cg.id
           JOIN users as u on u.id = ct.user_id
           JOIN currencies as c on c.id = l.currency_id
           WHERE ct.user_id = ${userId}
           GROUP BY
           ct.round_id, ct.user_id, l.currency_id, cg.id, u.username, c.code order by latest_created_at DESC LIMIT ${limit} OFFSET ${offset}`
        )

      const getCasinoTransactionCount = await sequelize.query(
        `SELECT COUNT(*)
        FROM (
          SELECT
            ct.round_id as "roundId", 
            ct.user_id as "userId", 
            l.currency_id as "currencyId", 
            cg.id as "gameId", 
            cg.name as "gameName", 
            u.username, 
           SUM(CASE WHEN l.purpose = '${LEDGER_PURPOSE.CASINO_BET}' THEN l.amount ELSE 0 END) AS betamount,
           SUM(CASE WHEN l.purpose = '${LEDGER_PURPOSE.CASINO_WIN}' THEN l.amount ELSE 0 END) AS winamount,
           SUM(CASE WHEN l.purpose = '${LEDGER_PURPOSE.CASINO_BET}' THEN l.fiat_amount ELSE 0 END) AS betfiatamount,
           SUM(CASE WHEN l.purpose = '${LEDGER_PURPOSE.CASINO_WIN}' THEN l.fiat_amount ELSE 0 END) AS winfiatamount,
            MAX(ct.created_at) AS latest_created_at
          FROM
            public.casino_transactions AS ct
          JOIN ledgers AS l ON ct.ledger_id = l.id
          JOIN casino_games AS cg ON ct.game_id = cg.id
          JOIN users AS u ON u.id = ct.user_id
          JOIN currencies AS c ON c.id = l.currency_id
                  WHERE ct.user_id = ${userId}
          GROUP BY
            ct.round_id, ct.user_id, l.currency_id, cg.id, u.username, c.code
        ) AS grouped_data`
        )

        const casinoTransaction = { count: getCasinoTransactionCount[0], rows: getUserCasinoTransaction[0]}

      return { casinoTransaction }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
