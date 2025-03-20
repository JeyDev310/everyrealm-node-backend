import { sequelize } from '@src/database'
import _ from 'lodash'
/**
 * This middleware handles database transaction automatically,
 * Include this middleware in your route if you want to include transactions in database queries
 * @type {import('express').Handler}
 */
export async function casinoDatabaseTransactionHandlerMiddleware(req, res, next) {
  req.context = req.context || {};

  if (!req.context.sequelize) {
    req.context.sequelize = sequelize;
  }

  req.context.sequelizeTransaction = await sequelize.transaction();
  const onFinishAndClose = async () => {
    if (~['commit', 'rollback'].indexOf(req.context.sequelizeTransaction.finished)) {
      return
    }

    if (~['4', '5'].indexOf(res.statusCode.toString()[0]) || _.size(res.payload?.errors) || !res.payload || !res.payload.statusCode) {
      await req.context.sequelizeTransaction.rollback()
      return
    }

    await req.context.sequelizeTransaction.commit()
  }

  res.on('finish', onFinishAndClose)
  res.on('close', onFinishAndClose)
  res.on('prefinish', onFinishAndClose)

  next()
}