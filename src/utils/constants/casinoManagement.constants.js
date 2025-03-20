export const CASINO_ENTITY_TYPES = {
  GAME: 'game',
  CATEGORY: 'category',
  PROVIDER: 'provider',
  AGGREGATOR: 'aggregator',
  SUB_CATEGORY: 'sub_category'
}

export const AGGREGATORS = {
  CASINO: {
    id: '1',
    name: 'casino'
  }
}

// CasinoTransaction constants start
export const CASINO_TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

/**
 * @type {Object.<string, { id: string, name: string, subCategories: { id: string, name: string }[] }[]>}
 */
export const DEFAULT_CATEGORIES = [{
  id: 1,
  name: 'Live'
}, {
  id: 2,
  name: 'Slot'
}, {
  id: 3,
  name: 'Virtuals'
}, {
  id: 4,
  name: 'TvGames'
}, {
  id: 5,
  name: 'Poker'
}, {
  id: 6,
  name: 'SportBook'
}]
