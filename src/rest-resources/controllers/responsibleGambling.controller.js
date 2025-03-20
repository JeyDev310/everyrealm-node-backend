import { decorateResponse } from '@src/helpers/response.helpers'
import { GetLimitsService } from '@src/services/responsibleGambling/getLimits.service'
import { ResetLimitService } from '@src/services/responsibleGambling/resetLimits.service'
import { UpdateLimitService } from '@src/services/responsibleGambling/updateLimit.service'
import { UpdateSelfExclusionService } from '@src/services/responsibleGambling/updateSelfExclusion.service'

export class ResponsibleGamblingController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getLimits (req, res, next) {
    try {
      const result = await GetLimitsService.execute({ userId: req.authenticated.userId }, req.context)
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
  static async getPlayerWithdrawalsInEuro (req, res, next) {
    try {
      const result = await GetPlayerWithdrawalsInEuro.execute({ userId: req.authenticated.userId }, req.context)
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
  static async updateLimit (req, res, next) {
    try {
      const result = await UpdateLimitService.execute({ userId: req.authenticated.userId, ...req.body }, req.context)
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
  static async updateSelfExclusion (req, res, next) {
    try {
      const result = await UpdateSelfExclusionService.execute({ userId: req.authenticated.userId, ...req.body }, req.context)
      req.session.destroy()
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
  static async resetLimit (req, res, next) {
    try {
      const result = await ResetLimitService.execute({ userId: req.authenticated.userId, ...req.body }, req.context)
      req.session.destroy()
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

}
