import { APIError } from '@src/errors/api.error'
import { getExpireAt } from '@src/helpers/common.helper'
import ajv from '@src/libs/ajv'
import { dayjs } from '@src/libs/dayjs'
import { NumberPrecision } from '@src/libs/numberPrecision'
import ServiceBase from '@src/libs/serviceBase'
import { messages } from '@src/utils/constants/error.constants'
import { USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES } from 'models/utils/constants/public.constants.utils'
import { Op } from 'sequelize'

const BET_LIMITS_ERROR_MAP = {
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_BET_LIMIT]: messages.DAILY_BET_LIMIT_EXCEEDED,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_BET_LIMIT]: messages.WEEKLY_BET_LIMIT_EXCEEDED,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_BET_LIMIT]: messages.MONTHLY_BET_LIMIT_EXCEEDED
}

const constraints = ajv.compile({
  type: 'object',
  properties: {
    amount: { type: 'string' },
    userId: { type: 'string' }
  },
  required: ['userId', 'amount']
})

export class CheckAndUpdateBetLimits extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const userId = this.args.userId
    const transaction = this.context.sequelizeTransaction

    try {
      const limits = await this.context.sequelize.models.userLimit.findAll({
        where: {
          userId,
          key: { [Op.in]: [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_BET_LIMIT, USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_BET_LIMIT, USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_BET_LIMIT] }
        },
        transaction
      })

      Promise.all(limits.map(async (limit) => {
        if (dayjs().isAfter(limit.expireAt)) {
          limit.currentValue = 0
          limit.expireAt = getExpireAt(limit.expireAt)
        }

        const totalLimitAmount = NumberPrecision.plus(limit.currentValue, this.args.amount)
        if (totalLimitAmount > limit.value) throw BET_LIMITS_ERROR_MAP[limit.key]

        limit.currentValue = totalLimitAmount
        await limit.save({ transaction })
      }))

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
