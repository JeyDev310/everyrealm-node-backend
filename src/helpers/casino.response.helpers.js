import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'
import _ from 'lodash'

const errorTypeToResponseMapper = {
  NotEnoughAmountErrorType: casinoErrorTypes.INSUFFICIENT_FUNDS,
  InvalidWalletIdErrorType: casinoErrorTypes.USER_NOT_FOUND,
  TournamentDoesNotExistErrorType: casinoErrorTypes.TOKEN_EXPIRED,
  TransactionAlreadyExistsErrorType: casinoErrorTypes.TRANSACTION_ALREADY_EXISTS
}

/**
 * @param {{
 *  req: import('express').Request,
 *  res: import('express').Response,
 *  next: import('express').NextFunction
 * }} param0
 * @param {import('@src/libs/serviceBase').default} param1
 * @returns {void}
 */
export const casinoResponseDecorator = ({ req, res, next }, { success, result, errors }, tournament = false) => {
  if (success) {
    const statusCode = result.statusCode
    delete result.statusCode
    if (statusCode === 200) {
      return res.status(200).json({ ...result })
    } else {
      if (statusCode === 107) {
        return res.status(403).json({ ...result, code: statusCode })
      }
      return res.status(412).json({ ...result, code: statusCode })
    }
  } else {
    return res.status(412).json(errors)
  }
}
