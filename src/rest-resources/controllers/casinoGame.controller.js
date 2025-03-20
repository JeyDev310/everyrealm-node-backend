import { casinoResponseDecorator } from '@src/helpers/casino.response.helpers';
import { CasinoGetBalanceService } from '@src/services/casino/providers/casino/callback/casinoGetBalance.service';
import { CasinoGetUserTokenService } from '@src/services/casino/providers/casino/callback/casinoGetUserToken.service';
import { CasinoMoveFundsService } from '@src/services/casino/providers/casino/callback/casinoMoveFunds.service';
import { CasinoPlayerDetailsService } from '@src/services/casino/providers/casino/callback/casinoPlayerDetails.service';
import { SoftSwissFreespinService } from '@src/services/casino/providers/casino/softSwiss/softSwissFreespin.service';
import { SoftSwissPlayService } from '@src/services/casino/providers/casino/softSwiss/SoftSwissPlayService';
import { SoftSwissRollbackService } from '@src/services/casino/providers/casino/softSwiss/softSwissRollback.service';
import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants';
import { logger } from '@src/utils/logger';

export class CasinoGameController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async moveFunds(req, res, next) {
    logger.info('Start(CasinoGameController-moveFunds)');
    try {
      const tournament = !!req.authenticated.tournamentId;
      let result;
      if (tournament) {
        result = await TournamentBetService.execute(
          {
            ...req.body,
            userId: req.authenticated.userId,
            walletId: req.authenticated.walletId,
            tournamentId: req.authenticated.tournamentId,
          },
          req.context,
        );
        if (result.result?.code === 200) {
          result.result = {
            balance: result.result.userTournament.points,
            status: true,
            statusCode: 200,
          };
        }
      } else {
        result = await CasinoMoveFundsService.execute(
          {
            ...req.body,
            userId: req.authenticated.userId,
            walletId: req.authenticated.walletId,
          },
          req.context,
        );
      }
      casinoResponseDecorator({ req, res, next }, result, tournament);
      logger.info('Return(CasinoGameController-moveFunds)');
    } catch (error) {
      logger.error('UnknownError(CasinoGameController-moveFunds):', { message: error.message, stack: error.stack });
      next(error);
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getUserToken(req, res, next) {
    logger.info('Start(CasinoGameController-getUserToken)');
    try {
      const result = await CasinoGetUserTokenService.execute(req.query, req.context);
      casinoResponseDecorator({ req, res, next }, result);
      logger.info('Return(CasinoGameController-getUserToken)');
    } catch (error) {
      logger.error('UnknownError(CasinoGameController-getUserToken):', { message: error.message, stack: error.stack });
      next(error);
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getBalance(req, res, next) {
    logger.info('Start(CasinoGameController-getBalance)');
    try {
      let result;
      const tournament = !!req.authenticated.tournamentId;
      if (tournament) {
        result = await TournamentGetBalanceService.execute(
          {
            tournamentId: req.authenticated.tournamentId,
            walletId: req.authenticated.walletId,
            userId: req.authenticated.userId,
          },
          req.context,
        );
        if (result.result?.code === 200) result.result = { status: true, balance: result.result.balance };
      } else {
        result = await CasinoGetBalanceService.execute(
          {
            walletId: req.authenticated.walletId,
            tournamentId: req.authenticated.tournamentId,
            ...req.query,
          },
          req.context,
        );
      }

      casinoResponseDecorator({ req, res, next }, result, tournament);
      logger.info('Return(CasinoGameController-getBalance)');
    } catch (error) {
      logger.error('UnknownError(CasinoGameController-getBalance):', { message: error.message, stack: error.stack });
      next(error);
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async play(req, res, next) {
    logger.info('Start(CasinoGameController-play)');
    try {
      const result = await SoftSwissPlayService.execute({ ...req.query, ...req.body }, req.context);

      casinoResponseDecorator({ req, res, next }, result);
      logger.info('Return(CasinoGameController-play)');
    } catch (error) {
      logger.error('UnknownError(CasinoGameController-play):', { message: error.message, stack: error.stack });
      next(error);
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async freespin(req, res, next) {
    logger.info('Start(CasinoGameController-freespin)');
    try {
      const result = await SoftSwissFreespinService.execute({ ...req.query, ...req.body }, req.context);
      casinoResponseDecorator({ req, res, next }, result);
      logger.info('Return(CasinoGameController-freespin)');
    } catch (error) {
      logger.error('UnknownError(CasinoGameController-freespin):', { message: error.message, stack: error.stack });
      next(error);
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async rollback(req, res, next) {
    logger.info('Start(CasinoGameController-rollback)');
    logger.info(`od1698: softswiss rollback req.query is ${JSON.stringify(req.query)}`);
    logger.info(`od1698: softswiss rollback req.body is ${JSON.stringify(req.body)}`);
    try {
      const result = await SoftSwissRollbackService.execute({ ...req.query, ...req.body }, req.context);
      casinoResponseDecorator({ req, res, next }, result);
      logger.info('Return(CasinoGameController-rollback)');
    } catch (error) {
      logger.error('UnknownError(CasinoGameController-rollback):', { message: error.message, stack: error.stack });
      next(error);
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async playerDetails(req, res, next) {
    logger.info('Start(CasinoGameController-playerDetails)');
    try {
      const result = await CasinoPlayerDetailsService.execute({ walletId: req.authenticated.walletId, tournamentId: req.authenticated.tournamentId, ...req.query }, req.context);
      casinoResponseDecorator({ req, res, next }, result);
      logger.info('Return(CasinoGameController-playerDetails)');
    } catch (error) {
      logger.error('UnknownError(CasinoGameController-playerDetails):', { message: error.message, stack: error.stack });
      next(error);
    }
  }
}
