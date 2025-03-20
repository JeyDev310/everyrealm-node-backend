import { appConfig } from '@src/configs'
import basicAuth from 'express-basic-auth'

export const isBasicAuthenticatedMiddleware = basicAuth({
  users: { [appConfig.internalBasicAuth.username]: appConfig.internalBasicAuth.password },
  challenge: true
})
