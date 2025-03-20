import { APIError } from '@src/errors/api.error'
import ServiceBase from '@src/libs/serviceBase'
import { LoadCasinoDataService } from '@src/services/casino/providers/casino/api/loadCasinoData.service'

export class LoadAllCasinoDataService extends ServiceBase {
  async run () {
    try {
      const languages = await this.context.sequelize.models.language.findAll({ attributes: ['id', 'code'], raw: true, transaction: this.context.sequelizeTransaction })
      await LoadCasinoDataService.execute({ languages }, this.context)
      return { success: true }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
