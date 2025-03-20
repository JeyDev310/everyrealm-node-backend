
import { models as casinoModels } from './casino'
import { models as publicModels } from './public'
import { models as paymentModels } from './payment'
import { models as rakebackBoostModel } from './reward'
/** @type {[typeof import('sequelize').Model]} */
export const models = [...publicModels, ...casinoModels, ...paymentModels, ...rakebackBoostModel]
