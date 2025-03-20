import { casinoResponseDecorator } from '@src/helpers/casino.response.helpers'
import { CasinoGetBalanceService } from '@src/services/casino/providers/casino/callback/casinoGetBalance.service'
import { CasinoGetUserTokenService } from '@src/services/casino/providers/casino/callback/casinoGetUserToken.service'
import { CasinoMoveFundsService } from '@src/services/casino/providers/casino/callback/casinoMoveFunds.service'
import { CasinoPlayerDetailsService } from '@src/services/casino/providers/casino/callback/casinoPlayerDetails.service'
import { CasinoSessionCheckService } from '@src/services/casino/providers/casino/callback/casinoSessionCheck.service'
import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'

export class CasinoSoftSwissController {

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async playerDetails (req, res, next) {
    try {
      const result = await CasinoPlayerDetailsService.execute({ walletId: req.authenticated.walletId, tournamentId: req.authenticated.tournamentId, ...req.query }, req.context)
      casinoResponseDecorator({ req, res, next }, result)
    } catch (error) {
      return casinoErrorTypes.UNKNOWN_ERROR
    }
  }
}
