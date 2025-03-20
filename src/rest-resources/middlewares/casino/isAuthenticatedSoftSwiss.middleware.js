import CryptoJS from 'crypto-js'
import encode from 'crypto-js/enc-hex'
import { casinoSoftSwissAggregatorConfig } from '@src/configs/casinoSoftSwissAggregator.config'
import { stringify } from 'lossless-json'
import { logger } from '@src/utils/logger'

export const isAuthenticated = async (req, res, next) => {
  let token
  if (req.url === '/play') {
    token = CryptoJS.HmacSHA256(stringify(req.body), casinoSoftSwissAggregatorConfig.accessToken).toString(encode)
  } else {
    token = CryptoJS.HmacSHA256(JSON.stringify(req.body), casinoSoftSwissAggregatorConfig.accessToken).toString(encode)
  }

  // if (req.body.user_id) { await setData(`userlastActivityTime:${req.body.user_id}`, new Date().toISOString()) }

  if (token !== req.headers['x-request-sign']) {
    return res.status(403).json({
      code: 403,
      message: `Request sign doesn't match.`
    })
  }
  next()
}
