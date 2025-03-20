import { APIError } from '@src/errors/api.error';
import ajv from '@src/libs/ajv';
import ServiceBase from '@src/libs/serviceBase';
import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils';
import { logger } from '@src/utils/logger';

const constraints = ajv.compile({
  type: 'object',
  properties: { userId: { type: 'string' } },
  required: ['userId']
});

export class GetUserService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    try {
      const { userId } = this.args;
      logger.info('Start(GetUserService):',{ userId })
      const user = await this.context.sequelize.models.user.findOne({
        where: {
          id: userId,
          isActive: true
        },
        include: [
          {
            model: this.context.sequelize.models.wallet,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: {
              attributes: { exclude: ['createdAt', 'updatedAt'] },
              model: this.context.sequelize.models.currency,
              where: { isActive: true },
              required: true
            }
          },
          {
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            model: this.context.sequelize.models.address
          }
        ]
      });
      if (!user) {
        logger.error('UserNotFound(GetUserService)');
        return this.addError('UserNotFoundErrorType');
      }

      const userDepositSumFiat = await this.context.sequelize.query(`select sum(l.fiat_amount) from transactions as t join ledgers as l on t.ledger_id = l.id where l.purpose = '${LEDGER_PURPOSE.DEPOSIT}' and t.user_id = ${userId};`, { logging: true });
      const userBet = await this.context.sequelize.query(`select sum(l.fiat_amount), count(l.fiat_amount) from casino_transactions as t join ledgers as l on t.ledger_id = l.id where l.purpose = '${LEDGER_PURPOSE.CASINO_BET}' and t.user_id = ${userId};`, { logging: true });
      const userDepositCount = await this.context.sequelize.query(`select count(*) from transactions as t join ledgers as l on t.ledger_id = l.id where l.purpose = '${LEDGER_PURPOSE.DEPOSIT}' and t.user_id = ${userId} and payment_id is not null;`, { logging: true });
      user.dataValues.totalDepositAmount = userDepositSumFiat[0][0]?.sum || 0;
      user.dataValues.totalWaggeredAmount = userBet[0][0]?.sum || 0;
      user.dataValues.totalWagger = userBet[0][0]?.count || 0;
      user.dataValues.userDepositCount = userDepositCount[0][0].count || 0;
      logger.info('Return(GetUserService):',{ user });
      return { user };
    } catch (error) {
      logger.error('UnknownError(GetUserService):', { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
