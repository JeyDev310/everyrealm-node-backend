export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'in-active',
  SETTLED: 'settled',
  CANCELLED: 'cancelled'
}

export const TOURNAMENT_PRIZE_TYPE = {
  CASH: 'cash',
  NONCASH: 'non-cash'
}

export const TRANSACTION_TYPE = {
  CREDIT: 'credit',
  DEBIT: 'debit'
}

export const TRANSACTION_PURPOSE = {
  BET: 'bet',
  WIN: 'win',
  LOSS: 'loss',
  ROLLBACK: 'rollback'
}

export const TOURNAMENT_RESPONSE = {
  GAME_NOT_EXIST: {
    message: 'GAME_NOT_EXIST',
    code: 400,
    status: 'error'
  },
  TRANSACTION_EXISTS: {
    message: 'TRANSACTION_EXISTS',
    code: 401,
    status: 'error'
  },
  SUCCESS: {
    message: 'SUCCESS',
    code: 200,
    status: 'success'
  },
  INVALID_BET_AMOUNT: {
    message: 'INVALID_BET_AMOUNT',
    code: 402,
    status: 'error'
  },
  USER_NOT_FOUND: {
    message: 'USER_NOT_FOUND',
    code: 403,
    status: 'error'
  },
  TOURNAMENT_NOT_FOUND: {
    message: 'TOURNAMENT_NOT_FOUND',
    code: 404,
    status: 'error'
  },
  INSUFFICIENT_FUNDS: {
    message: 'INSUFFICIENT_FUNDS',
    code: 405,
    status: 'error'
  },
  INTERNAL_SERVER_ERROR: {
    message: 'INTERNAL_SERVER_ERROR',
    code: 500,
    status: 'error'
  }
}
