import { CasinoAggregator } from './casinoAggregator'
import { CasinoCategory } from './casinoCategory'
import { CasinoGame } from './casinoGame'
import { CasinoProvider } from './casinoProvider'
import { CasinoTransaction } from './casinoTransaction'
import { CasinoGameCategory } from './casinoGameCategory'


/** @type {[typeof import('sequelize').Model]} */
export const models = [
  CasinoGame,
  CasinoProvider,
  CasinoAggregator,
  CasinoTransaction,
  CasinoCategory,
  CasinoGameCategory
]
