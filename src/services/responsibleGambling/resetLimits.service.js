import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES } from '@src/utils/constants/public.constants.utils'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    dailyDepositLimit: { type: 'boolean' },
    weeklyDepositLimit: { type: 'boolean' },
    monthlyDepositLimit: { type: 'boolean' },
    dailyBetLimit: { type: 'boolean' },
    weeklyBetLimit: { type: 'boolean' },
    monthlyBetLimit: { type: 'boolean' },
    selfExclusion: { type: 'boolean' },
    userId: {type: ['number', 'string']}
  },
  required: []
})

export class ResetLimitService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {

    const { dailyDepositLimit, weeklyDepositLimit, monthlyDepositLimit, dailyBetLimit, weeklyBetLimit, monthlyBetLimit, selfExclusion } = this.args
    const transaction = this.context.sequelizeTransaction

    try {
      if (dailyDepositLimit) {
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_DEPOSIT_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = null
        limit.value = ''
        await limit.save({transaction})
      }

      if (weeklyDepositLimit) {
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_DEPOSIT_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = null
        limit.value = ''
        await limit.save({transaction})
      }
      if (monthlyDepositLimit) {
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_DEPOSIT_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = null
        limit.value = ''
        await limit.save({transaction})
      }
      if (dailyBetLimit) {
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_BET_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = null
        limit.value = ''
        await limit.save({transaction})
      }
      if (weeklyBetLimit) {
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_BET_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = null
      limit.value = ''
        await limit.save({transaction})
      }
      if (monthlyBetLimit) {
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_BET_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = null
        limit.value = ''
        await limit.save({transaction})
      }
      if (selfExclusion) {
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.SELF_EXCLUSION, userId: this.args.userId },
          transaction
        })

        limit.expireAt = null
        limit.value = ''
        await limit.save({transaction})
      }

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
