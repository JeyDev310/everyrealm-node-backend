import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { SendResetPasswordEmailService } from '@src/services/emailTemplate/sendResetPasswordEmail.service'
import { JWT_TOKEN_TYPES } from '@src/utils/constants/app.constants'
import Jwt from 'jsonwebtoken'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string' }
  },
  required: ['email']
})

export class ForgotPasswordService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const transaction = this.context.sequelizeTransaction
    try {
      const user = await this.context.sequelize.models.user.findOne({ attributes: ['id', 'email', 'emailVerified'], where: { email: this.args.email }, transaction })

      if (!user) return this.addError('UserDoesNotExistsErrorType')
      if (!user.emailVerified) return this.addError('EmailNotVerifiedErrorType')

      const token = Jwt.sign({ userId: user.id, type: JWT_TOKEN_TYPES.FORGOT_PASSWORD }, appConfig.jwt.secret, { expiresIn: appConfig.jwt.expiry })
      const { result: emailSent } = await SendResetPasswordEmailService.execute({ token, email: user.email }, this.context)

      return { emailSent }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
