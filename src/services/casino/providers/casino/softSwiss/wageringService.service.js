import { sequelize } from "@src/database";
import { APIError } from "@src/errors/api.error";
import ajv from "@src/libs/ajv";
import ServiceBase from "@src/libs/serviceBase";
import { DepositWagerService } from "@src/services/casino/common/1xwager.service";
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    betAmount: { type: 'string' },
    currencyId: { type: 'string' },
    gameId: { type: 'string' },
    gameRtp: { type: 'number' },
    userId: { type: 'string' },
    walletId: { type: 'string' },
  },
  required: ['betAmount', 'userId', 'walletId']
});

export class WageringService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const startTime = Date.now();

    const { userId, betAmount, walletId, gameId, gameRtp, currencyId } = this.args;
    logger.info('Start(WageringService):', { userId, betAmount, walletId, gameId, gameRtp, currencyId });

    const transaction = this.context?.sequelizeTransaction;
    if (!transaction) {
      logger.error(`Transaction not found in context for WageringService`);
      throw new APIError(`Transaction not found in context for WageringService`);
    }

    try {
      await DepositWagerService.execute({
        betAmount,
        seqTransaction: transaction,
        userId,
        walletId,
      }, this.context);

      logger.info('Return(WageringService)');
    } catch (error) {
      logger.error('UnknownError(WageringService):', { message: error.message, stack: error.stack });
      throw new APIError(error);
    } finally {
      const elapsedTime = Date.now() - startTime;
      logger.info(`_Execution time for WageringService: ${elapsedTime}ms`);
    }
  }
}
