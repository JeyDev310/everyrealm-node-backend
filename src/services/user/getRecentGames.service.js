import { APIError } from '@src/errors/api.error'
import ajv from '../../libs/ajv'
import ServiceBase from '../../libs/serviceBase'

const schema = {
  type: 'object',
  properties: {
    page: { type: 'string', default: 1 },
    perPage: { type: 'string', default: 10 },
    userId: { type: 'string' }
  },
  required: ['userId']
}

const constraints = ajv.compile(schema)

export class GetRecentGamesService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const { userId } = this.args
    try {
      const queryObject = `select distinct(ct.game_id), ct.created_at, ct.user_id,
      cg.name AS "game_name", cg.unique_id,
      cp.id AS "provider_id", cp.name AS "provider_name", cp.icon_url AS "provider_icon",
      csc.id AS "sub_category_id", csc.name AS "sub_category_name", csc.icon_url AS "sub_category_icon"
      from casino_transactions as ct
      join casino_games as cg on cg.id = ct.game_id
      join casino_providers as cp on cp.id = cg.casino_provider_id
      join casino_providers as csc on csc.id = cg.casino_sub_category_id
      where user_id = ${userId}`

      const orderByClause = 'ORDER BY created_at desc'
      const limitClause = 'LIMIT 10'
      const queryString = `${queryObject} ${orderByClause} ${limitClause};`

      const recentGameData = await this.context.sequelize.query(queryString, { type: this.context.sequelize.QueryTypes.SELECT })
      const data = recentGameData

      return { data }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
