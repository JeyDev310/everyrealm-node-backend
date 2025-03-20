import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    privyId: { type: 'string' }
  },
  required: ['privyId']
})

export class LogoutService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {

      const user = await this.context.sequelize.models.user.findOne({ where: { privyId: this.args.privyId } })
      // if (!user.loggedIn) return this.addError('UserNotLoggedInErrorType')

      user.loggedIn = false
      await user.save()

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
