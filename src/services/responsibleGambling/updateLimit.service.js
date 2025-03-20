import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { dayjs } from '@src/libs/dayjs'
import ServiceBase from '@src/libs/serviceBase'
import { USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES } from '@src/utils/constants/public.constants.utils'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    dailyDepositLimit: { type: 'number' },
    weeklyDepositLimit: { type: 'number' },
    monthlyDepositLimit: { type: 'number' },
    dailyBetLimit: { type: 'number' },
    weeklyBetLimit: { type: 'number' },
    monthlyBetLimit: { type: 'number' },
    userId: {type: ['number', 'string']}
  },
  required: []
})

export class UpdateLimitService extends ServiceBase {
  get constraints () {
    return constraints
  }

  /**
   * @param {string} key
   */
  getExpireAt (key) {
    if (key.includes('daily')) return dayjs().add(24, 'h')
    if (key.includes('weekly')) return dayjs().add(1, 'w')
    if (key.includes('monthly')) return dayjs().add(1, 'M')
  }

  async run () {

    const { dailyDepositLimit, weeklyDepositLimit, monthlyDepositLimit, dailyBetLimit, weeklyBetLimit, monthlyBetLimit } = this.args
    const transaction = this.context.sequelizeTransaction

    try {
      if (+dailyDepositLimit >= 0) {
        if (isNaN(dailyDepositLimit) || !isFinite(dailyDepositLimit)) return this.addError('InvalidValueErrorType')
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_DEPOSIT_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = this.getExpireAt(limit.key)
        limit.value = dailyDepositLimit
        await limit.save({transaction})
      }

      if (+weeklyDepositLimit >= 0) {
        if (isNaN(weeklyDepositLimit) || !isFinite(weeklyDepositLimit)) return this.addError('InvalidValueErrorType')
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_DEPOSIT_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = this.getExpireAt(limit.key)
        limit.value = weeklyDepositLimit
        await limit.save({transaction})
      }
      if (+monthlyDepositLimit >= 0) {
        if (isNaN(monthlyDepositLimit) || !isFinite(monthlyDepositLimit)) return this.addError('InvalidValueErrorType')
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_DEPOSIT_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = this.getExpireAt(limit.key)
        limit.value = monthlyDepositLimit
        await limit.save({transaction})
      }
      if (+dailyBetLimit >= 0) {
        if (isNaN(dailyBetLimit) || !isFinite(dailyBetLimit)) return this.addError('InvalidValueErrorType')
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_BET_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = this.getExpireAt(limit.key)
        limit.value = dailyBetLimit
        await limit.save({transaction})
      }
      if (+weeklyBetLimit >= 0) {
        if (isNaN(weeklyBetLimit) || !isFinite(weeklyBetLimit)) return this.addError('InvalidValueErrorType')
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_BET_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = this.getExpireAt(limit.key)
        limit.value = weeklyBetLimit
        await limit.save({transaction})
      }
      if (+monthlyBetLimit >= 0) {
        if (isNaN(monthlyBetLimit) || !isFinite(monthlyBetLimit)) return this.addError('InvalidValueErrorType')
        const limit = await this.context.sequelize.models.userLimit.findOne({
          where: { key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_BET_LIMIT, userId: this.args.userId },
          transaction
        })

        limit.expireAt = this.getExpireAt(limit.key)
        limit.value = monthlyBetLimit
        await limit.save({transaction})
      }

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
