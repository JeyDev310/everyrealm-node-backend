import { APIError } from '@src/errors/api.error'
import ServiceBase from '@src/libs/serviceBase'

export class GetSettingsService extends ServiceBase {
  async run() {
    try {
      const settings = await this.context.sequelize.models.setting.findAll({ raw: true })
      return settings.reduce((prev, setting) => {
        prev[setting.key] = setting.value
        return prev
      }, {})

    } catch (error) {
      throw new APIError(error)
    }
  }
}
