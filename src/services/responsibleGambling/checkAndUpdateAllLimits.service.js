import { sequelize } from '@src/database'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { dayjs } from '@src/libs/dayjs'
import ServiceBase from '@src/libs/serviceBase'
import { SELF_EXCLUSION_TYPES, USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES } from '@src/utils/constants/public.constants.utils'
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' }
  },
  required: ['userId']
})

export class CheckAndUpdateAllLimits extends ServiceBase {
  get constraints () {
    return constraints
  }

  /**
   * @param {string} key
   */
  getExpireAt (key, previousExpireAt) {
    let timeUnit = ''
    if (key.includes('daily')) timeUnit = 'd'
    else if (key.includes('weekly')) timeUnit = 'w'
    else if (key.includes('monthly')) timeUnit = 'M'
    else return null

    return dayjs().add(dayjs().diff(previousExpireAt, timeUnit) + 1, timeUnit).format()
  }

  async run () {
    const isInternalTransaction = !this.context.sequelizeTransaction
    const transaction = this.context.sequelizeTransaction || await sequelize.transaction()
    const userId = this.args.userId

    try {
      const limits = await this.context.sequelize.models.userLimit.findAll({ where: { userId }, transaction })

      await Promise.all(limits.map(async limit => {
        if (limit.key === USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.SELF_EXCLUSION) {
          if (limit.value === SELF_EXCLUSION_TYPES.PERMANENT) return this.addError('ExcludedPermanentlyPleaseContactProviderErrorType')
          if (limit.value === SELF_EXCLUSION_TYPES.TEMPORARY && !dayjs().isAfter(limit.expireAt)) return this.addError('ExcludedPermanentlyPleaseContactProviderErrorType')

          limit.value = limit.currentValue = ''
          limit.expireAt = null
          if (this.context.req.path !== '/get-user') {
            await this.context.sequelize.models.user.update({ isActive: true }, {
              where: { id: userId },
              transaction
            })
          }
        } else if (dayjs().isAfter(limit.expireAt)) {
          limit.currentValue = ''
          limit.expireAt = this.getExpireAt(limit.key, limit.expireAt)
        }

        await limit.save({ transaction })
        return limit
      }))

      if (isInternalTransaction) await transaction.commit()
      return { success: true }
    } catch (error) {
      logger.error('================',  { message: error.message, stack: error.stack })
      if (isInternalTransaction) await transaction.rollback()
      throw new APIError(error)
    }
  }
}
