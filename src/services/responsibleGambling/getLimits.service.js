import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES } from '@src/utils/constants/public.constants.utils'
import _ from 'lodash'
import { Op } from 'sequelize'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class GetLimitsService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const limits = await this.context.sequelize.models.userLimit.findAll({
        attributes: { exclude: ['createdAt', 'updatedAt'] },
        where: { userId: this.args.userId,
          [Op.or]: [{ key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_BET_LIMIT }, { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_BET_LIMIT }, { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_BET_LIMIT },
            { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_DEPOSIT_LIMIT }, { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_DEPOSIT_LIMIT }, { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_DEPOSIT_LIMIT }, { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.SELF_EXCLUSION }
          ]
         },
        raw: true
      })
      return {
        limits: limits.map(limit => {
          limit.key = _.camelCase(limit.key)
          return limit
        })
      }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
