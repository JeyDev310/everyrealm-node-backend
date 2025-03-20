export const NAMESPACES = {
  PUBLIC: '/public',
  PRIVATE: '/private',
  INTERNAL: '/internal'
}

export const ROOMS = {
  PRIVATE: {
    BET: 'bet',
    WALLET: 'wallet',
    LOGOUT: 'logout',
    EXCHANGE_BET: 'exchange_bet',
    DEPOSIT: 'deposit',
    WITHDRAW: 'withdraw',
    EXCHANGE_RATE: 'exchange_rate',
    BET_LIMIT: 'bet_limit'
  },
  PUBLIC: {
    IN_PLAY: 'in-play',
    PRE_MATCH: 'pre-match',
    ORDER_BOOK: 'order-book',
    RELOAD_HISTORY:'reload_history',
  },
  INTERNAL: {
    CASINO_TRANSACTION: 'casino-transaction'
  }
}

export const EVENTS = {
  BET: 'bet',
  RELOAD_HISTORY:'reload_history',
  WALLET: 'wallet',
  EXCHANGE_BET: 'exchange_bet',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  EXCHANGE_RATE: 'exchange_rate',
  BET_LIMIT: 'bet_limit'
}
