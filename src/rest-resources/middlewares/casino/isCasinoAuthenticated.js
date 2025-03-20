import { casinoErrorTypes } from '@src/utils/constants/casinoProviders/casino.constants'
import { StatusCodes } from 'http-status-codes'
import Jwt from 'jsonwebtoken'
import SHA256 from 'sha256'
import { appConfig } from 'src/configs'

export const isCasinoAuthenticated = (req, res, next) => {
  const hashAuth = req.headers['hash-authorization'] || ''

  try {
    const data = req.method === 'POST' ? req.body : req.query
    const hash = SHA256(JSON.stringify(Object.keys(data).sort().reduce((obj, key) => {
      if (key !== 'extraData') obj[key] = String(data[key])
      return obj
    }, {})) + casinoGame.authKey).toString()

    if (hash !== hashAuth) return res.status(StatusCodes.OK).send(casinoErrorTypes.UNKNOWN_ERROR)

    const token = data.token
    if (!token) return res.status(StatusCodes.OK).send(casinoErrorTypes.TOKEN_NOT_FOUND)
    const decodedData = Jwt.verify(token, appConfig.jwt.secret)
    req.authenticated = {
      userId: decodedData.userId,
      walletId: decodedData.walletId,
      tournamentId: decodedData.tournamentId
    }
    next()
  } catch (error) {
    return res.status(StatusCodes.OK).send(casinoErrorTypes.TOKEN_EXPIRED)
  }
}
