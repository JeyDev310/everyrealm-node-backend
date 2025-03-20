import { databaseOptions } from '@src/configs'
import { addModelsSchemaToAjv } from '@src/helpers/ajv.helper'
import Sequelize from 'sequelize'
import { models } from './models'
import { logger } from '@src/utils/logger'

/** @type {Sequelize.Sequelize} */
const sequelize = new Sequelize({ ...databaseOptions })

models.forEach(model => {
  model.init(sequelize)
})

models.forEach(model => {
  model.associate(sequelize.models)
})

addModelsSchemaToAjv(models)

sequelize.authenticate().then(() => {
  logger.info('Database', { message: 'Connected...' })
}).catch(error => {
  logger.error('Database', { exception: error })
  throw error
})

const databaseCloseFn = sequelize.close.bind(sequelize)

sequelize.close = async () => {
  await databaseCloseFn()
  logger.error('Database', { message: 'Closed...' })
}

export { sequelize }
