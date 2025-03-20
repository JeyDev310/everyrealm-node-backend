import { decorateResponse } from '@src/helpers/response.helpers'
import { GetAllCasinoGamesService } from '@src/services/casino/getAllGames.service'
import { GetCasinoGameService } from '@src/services/casino/getGame.service'
import { GetBetsHistoryService } from '@src/services/casino/getBetsHistory.service'
import { GetCasinoCategoryService } from '@src/services/casino/getCasinoCategory.service'
import { GetCasinoProvidersService } from '@src/services/casino/getCasinoProviders.service'
import { GetCasinoTransactionService } from '@src/services/casino/getCasinoTransactions.service'
import { GetFavoriteGamesService } from '@src/services/casino/getFavoriteGames.service'
import { InitGameService } from '@src/services/casino/initGame.service'
import { InitGameDemoService } from '@src/services/casino/initGameDemo.service'
import { ToggleFavoriteGameService } from '@src/services/casino/toggleFavoriteGame.service'
import { getIp } from '@src/utils'

export class CasinoController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getAllGames (req, res, next) {
    try {
      const result = await GetAllCasinoGamesService.execute({ ...req.query, userId: req?.authenticated?.userId, ipAddress: getIp(req) }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getGame (req, res, next) {
    try {
      const result = await GetCasinoGameService.execute({ ...req.query }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getGameProvider (req, res, next) {
    try {
      const result = await GetCasinoProvidersService.execute({ ...req.body, ipAddress: getIp(req) }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getGameCategory (req, res, next) {
    try {
      const result = await GetCasinoCategoryService.execute(req.query, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async toggleFavoriteGame (req, res, next) {
    try {
      const result = await ToggleFavoriteGameService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getFavoriteGame (req, res, next) {
    try {
      const result = await GetFavoriteGamesService.execute({ ...req.query, userId: req.authenticated.userId, ipAddress: getIp(req) }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async initGame (req, res, next) {
    try {
      const result = await InitGameService.execute({ ...req.body, userId: req.authenticated.userId, ipAddress: getIp(req) }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async initGameDemo (req, res, next) {
    try {
      const result = await InitGameDemoService.execute({ ...req.body, ipAddress: getIp(req) }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async initDemoGame (req, res, next) {
    try {
      const result = await InitGameService.execute({ ...req.body, ipAddress: getIp(req) }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getCasinoTransactions (req, res, next) {
    try {
      const result = await GetCasinoTransactionService.execute({ ...req.query, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getCasinoHistory (req, res, next) {
    try {
      const result = await GetBetsHistoryService.execute({ ...req.query, userId: req.authenticated?.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }
}
