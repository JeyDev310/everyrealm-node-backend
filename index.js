import { appConfig } from '@src/configs'
import { populateCache } from '@src/helpers/populateLocalCache.helper'
import { removeExpiredSessions } from '@src/helpers/session.helper'
import '@src/libs/gracefulShutdown'
import { configureCachedI18n, i18n } from '@src/libs/i18n'
import redisClient from '@src/libs/redisClient'
import { contextMiddleware } from '@src/rest-resources/middlewares/context.middleware'
import { errorHandlerMiddleware } from '@src/rest-resources/middlewares/errorHandler.middleware'
import morganMiddleware from '@src/rest-resources/middlewares/morgan.middleware'
import routes from '@src/rest-resources/routes'
import { socketServer } from '@src/socket-resources'
import { CACHE_STORE_PREFIXES, COOKIE_KEYS } from '@src/utils/constants/app.constants'
import { logger } from '@src/utils/logger'
import bodyParser from 'body-parser'
import RedisStore from 'connect-redis'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import helmet from 'helmet'
import { createServer } from 'http'

(async () => {
  await removeExpiredSessions()
  await populateCache()
  await configureCachedI18n()

  const redisStore = new RedisStore({
    client: redisClient.client,
    prefix: CACHE_STORE_PREFIXES.SESSION
  })

  const port = appConfig.port
  const app = express()
  app.use(morganMiddleware);

  app.use(session({
    name: COOKIE_KEYS.ACCESS_TOKEN,
    secret: appConfig.session.secret,
    saveUninitialized: false,
    resave: false,
    store: redisStore,
    proxy: true,
    cookie: {
      maxAge: appConfig.session.expiry,
      httpOnly: true,
      ...(appConfig.env === 'production' ? { secure: true, sameSite: 'none' } : { secure: false })
    }
  }))

  app.use(cors({
    origin: appConfig.cors,
    credentials: true
  }))

  app.use(helmet())

  app.use(bodyParser.json())

  app.use(bodyParser.urlencoded({ extended: true }))


  app.use(i18n.init)

  app.use(contextMiddleware)

  app.use(routes)

  app.use(errorHandlerMiddleware)

  const httpServer = createServer(app)

  socketServer.attach(httpServer)

  httpServer.listen({ port }, () => {
    logger.info({message: `Server started on port ${port}`})
  })
})()
