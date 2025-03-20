import { sequelize } from '@src/database'
import { i18n } from '@src/libs/i18n'
import { v4 as uuid } from 'uuid'

/**
 * Creates a context for keeping request track if included in a request
 * Attach context object in request object, context object will hold following properties
 * traceId - id of the request
 * sequelize - sequelize database connection
 * dbModels - all sequelize models
 * socketEmitter - socket emitter for emitting data directly
 *
 * NOTO: If you want to update request.context interface please see file custom.d.ts
 *
 * @type {import('express').Handler}
 */
export function contextMiddleware (req, _, next) {
  req.context = {}
  req.authenticated = false

  req.context.locale = req?.headers?.locale || i18n.getLocale().toUpperCase()
  req.context.traceId = uuid()
  req.context.sequelize = sequelize
  req.context.reqTimeStamp = Date.now()
  req.context.models = sequelize.models
  req.context.req = req

  next()
}
