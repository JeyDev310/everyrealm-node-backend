
import { casinoResponseDecorator } from '@src/helpers/casino.response.helpers'

import { OriginalPlayService } from '@src/services/casino/providers/casino/original/OriginalPlay.service'
import { OriginalGetBalanceService } from '@src/services/casino/providers/casino/original/OriginalGetBalance.service'
import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'

export class OriginalGameController {  
 
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getBalance(req, res, next) {

    try { 
      const result = await OriginalGetBalanceService.execute(req.query, req.context); 
      casinoResponseDecorator({ req, res, next }, result)

    } catch (error) {
      next(error)

    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async play(req, res, next) {
    try {

      const result = await OriginalPlayService.execute({ ...req.query, ...req.body }, req.context); 
      casinoResponseDecorator({ req, res, next }, result)
    } catch (error) {
      next(error)

    }
  }

}
