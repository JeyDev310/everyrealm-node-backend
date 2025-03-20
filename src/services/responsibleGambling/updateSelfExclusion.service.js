import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { dayjs } from '@src/libs/dayjs'
import ServiceBase from '@src/libs/serviceBase'
import { SELF_EXCLUSION_TYPES, USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES } from '@src/utils/constants/public.constants.utils'

const constraints = ajv.compile({
  anyOf: [{
    type: 'object',
    properties: {
      userId: { type: 'string' },
      expireIn: { type: 'string' },
      selfExclusionType: { const: SELF_EXCLUSION_TYPES.TEMPORARY }
    },
    required: ['userId', 'expireIn']
  }, {
    type: 'object',
    properties: {
      userId: { type: 'string' },
      selfExclusionType: { const: SELF_EXCLUSION_TYPES.PERMANENT }
    },
    required: ['userId']
  }]
})

export class UpdateSelfExclusionService extends ServiceBase {
  get constraints () {
    return constraints
  }

  get expireAt () {
    if (!this.args.expireIn || this.args.selfExclusionType === SELF_EXCLUSION_TYPES.PERMANENT) return null
    const [value, timeUnit] = this.args.expireIn.split('')
    if (!['d', 'w', 'M', 'Q', 'y', 'h', 'm', 's', 'ms'].includes(timeUnit)) return this.addError('InvalidTimeUnitErrorType')

    return dayjs().add(value, timeUnit)
  }

  async run () {
    try {
      const transaction = this.context.sequelizeTransaction
      const userId = this.args.userId

      await this.context.sequelize.models.userLimit.update({
        value: this.args.selfExclusionType,
        currentValue: this.args.selfExclusionType,
        expireAt: this.expireAt
      }, {
        where: {
          userId,
          key: USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.SELF_EXCLUSION
        },
        transaction
      })

      const userUpdateData = { loggedIn: false }
      if (this.args.selfExclusionType === SELF_EXCLUSION_TYPES.PERMANENT) userUpdateData.isActive = false
      userUpdateData.isActive = false

      await this.context.sequelize.models.user.update(userUpdateData, {
        where: { id: userId },
        transaction
      })

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
