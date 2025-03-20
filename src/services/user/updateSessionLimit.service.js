import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    sessionLimit: { type: 'number' }
  },
  required: ['userId']
})

export class UpdateSessionLimitService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const sessionLimit = this.args.sessionLimit || null
    try {
      await this.context.sequelize.models.user.update({ sessionLimit }, { where: { id: this.args.userId } })
      return { success: true, sessionLimit }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
