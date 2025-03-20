import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv';
import ServiceBase from '@src/libs/serviceBase';
import { GetIpLocationService } from '@src/services/common/getIpLocation.service';
import { Op, or } from 'sequelize';
import { logger } from '@src/utils/logger';

const constraints = ajv.compile({
  type: 'object',
  properties: { ipAddress: { type: 'string' } },
  required: ['ipAddress']
});

export class GetCasinoProvidersService extends ServiceBase {
  get constraints () {
    return constraints;
  }

  async run () {
    try {
      const { ipAddress } = this.args;
      logger.info('Start(GetCasinoProvidersService):', { ipAddress });
      const { result: country } = await GetIpLocationService.execute({ ipAddress }, this.context);

      const providers = await this.context.sequelize.models.casinoProvider.findAll({
        attributes: ['id', 'name', 'iconUrl', 'orderId'],
        where: {
          [Op.not]: { restrictedCountries: { [Op.contains]: country.id } },
          isActive: true
        },
        include: {
          model: this.context.sequelize.models.casinoGame,
          attributes: [],
          where: { [Op.not]: { restrictedCountries: { [Op.contains]: country.id } } },
          required: true
        },
        order: [['orderId', 'ASC']],
        group: ['casinoProvider.id', 'casinoProvider.name', 'iconUrl']
      });

      logger.debug('Return(GetCasinoProvidersService):', { providers });
      return { providers };
    } catch (error) {
      logger.error('UnknownError(GetCasinoProvidersService):',  { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
