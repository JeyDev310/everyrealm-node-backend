import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { JWT_TOKEN_TYPES } from '@src/utils/constants/app.constants'
import Jwt from 'jsonwebtoken'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    token: { type: 'string' }
  },
  required: ['token']
})

export class VerifyEmailService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const transaction = this.context.sequelizeTransaction
    try {
      const data = Jwt.verify(this.args.token, appConfig.jwt.secret)

      if (!data) return this.addError('InvalidTokenErrorType')
      if (data.type !== JWT_TOKEN_TYPES.VERIFY_EMAIL) return this.addError('WrongTokenTypeErrorType')

      const user = await this.context.sequelize.models.user.findOne({
        where: { id: data.userId, isActive: true },
        include: {
          model: this.context.models.wallet,
        },
        transaction
      })
      if (!user) return this.addError('UserDoesNotExistsErrorType')

      if (user.emailVerified == true) return this.addError('EmailAlreadyVerifiedErrorType')


      user.emailVerified = true
      await user.save({ transaction })

      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
