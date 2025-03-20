import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { JWT_TOKEN_TYPES } from '@src/utils/constants/app.constants'
import Jwt from 'jsonwebtoken'
import { UpdatePasswordService } from './updatePassword.service'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    token: { type: 'string' },
    newPassword: { type: 'string' }
  },
  required: ['token', 'newPassword']
})

export class VerifyForgotPasswordService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    try {
      const data = Jwt.verify(this.args.token, appConfig.jwt.secret)

      if (!data) return this.addError('InvalidTokenErrorType')
      if (data.type !== JWT_TOKEN_TYPES.FORGOT_PASSWORD) return this.addError('WrongTokenTypeErrorType')

      await UpdatePasswordService.execute({ userId: data.userId, newPassword: this.args.newPassword }, this.context)
      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
