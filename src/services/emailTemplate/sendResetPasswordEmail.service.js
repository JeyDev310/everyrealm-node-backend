import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { sendEmail } from '@src/libs/emailSender'
import ServiceBase from '@src/libs/serviceBase'
import { GetSettingsService } from '@src/services/common/getSettings.service'
import { SETTING_KEYS } from '@src/utils/constants/app.constants'
import { EMAIL_TEMPLATE_EVENT_TYPES } from '@src/utils/constants/public.constants.utils'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string' },
    name: { type: 'string' },
    token: { type: 'string' }
  },
  required: ['email', 'token']
})

export class SendResetPasswordEmailService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    let template = ''
    const token = this.args.token

    try {
      const emailTemplate = await this.context.sequelize.models.emailTemplate.findOne({ where: { eventType: EMAIL_TEMPLATE_EVENT_TYPES.RESET_PASSWORD, isDefault: true }, transaction: this.context.sequelizeTransaction })
      const { result: settings } = await GetSettingsService.execute({}, this.context)
      if (!emailTemplate) {
        template = `
          <h3>Click on the following link to reset the password</h3>
          <li>${settings[SETTING_KEYS.USER_END_URL]}/reset-password?token=${token}<li>
        `
      } else {
        const replaceableData = {
          link: `${settings[SETTING_KEYS.USER_END_URL]}/reset-password?token=${token}`,
          siteName: settings[SETTING_KEYS.APPLICATION_NAME],
          siteLogo: settings[SETTING_KEYS.LOGO],
          siteUrl: settings[SETTING_KEYS.USER_END_URL]
        }
        template = emailTemplate.templateCode[this.context.locale]
        emailTemplate.dynamicData.forEach(field => {
          template = template.replace(`{{{${field}}}}`, replaceableData[field])
        })
      }

      const emailVerificationSent = await sendEmail(this.args.email, this.args.name || this.args.email, 'Reset Password', template)
      return emailVerificationSent
    } catch (error) {
      throw new APIError(error)
    }
  }
}
