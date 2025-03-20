import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import bcrypt from 'bcrypt'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    newPassword: { type: 'string' }
  },
  required: ['userId', 'newPassword']
})

export class UpdatePasswordService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const transaction = this.context.sequelizeTransaction

    try {
      const user = await this.context.sequelize.models.user.findOne({ where: { id: this.args.userId }, transaction })
      if (!user) return this.addError('UserDoesNotExistsErrorType')

      user.password = await bcrypt.hash(this.args.newPassword, appConfig.bcrypt.salt)
      await user.save({ transaction })

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
