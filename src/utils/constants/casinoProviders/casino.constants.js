import { TOURNAMENT_RESPONSE } from '../casinoTournament.constants'

export const DEVICE_TYPES = {
  MOBILE: 'Mobile',
  DESKTOP: 'Desktop',
  ALL_DEVICES: 'All device'
}

export const ERROR_CODES = {
  UNKNOWN_ERROR: 400,
  USER_NOT_FOUND: 404,
  USER_BLOCKED: 405,
  DEBIT_TRANSACTION_NOT_FOUND: 406,
  TOKEN_NOT_FOUND: 417,
  TOKEN_EXPIRED: 410,
  TRANSACTION_ALREADY_EXISTS: 409,
  INSUFFICIENT_FUNDS: 402,
  BETTING_LIMIT_EXCEEDED: 456
}

export const DIRECTION = {
  DEBIT: 'debit',
  CREDIT: 'credit'
}

export const casinoErrorTypes = {
  UNKNOWN_ERROR: {
    status: false,
    errors: {
      code: ERROR_CODES.UNKNOWN_ERROR,
      error: 'Unknown error occurred'
    }
  },
  USER_NOT_FOUND: {
    status: false,
    errors: {
      code: ERROR_CODES.USER_NOT_FOUND,
      error: 'User not found'
    }
  },
  USER_BLOCKED: {
    status: false,
    errors: {
      code: ERROR_CODES.USER_BLOCKED,
      error: 'User blocked'
    }
  },
  DEBIT_TRANSACTION_NOT_FOUND: {
    status: false,
    errors: {
      code: ERROR_CODES.DEBIT_TRANSACTION_NOT_FOUND,
      error: 'Debit transaction not found in this event'
    }
  },
  TOKEN_NOT_FOUND: {
    status: false,
    errors: {
      code: ERROR_CODES.TOKEN_NOT_FOUND,
      error: 'Token not found'
    }
  },
  TOKEN_EXPIRED: {
    status: false,
    errors: {
      code: ERROR_CODES.TOKEN_EXPIRED,
      error: 'Token expired'
    }
  },
  TRANSACTION_ALREADY_EXISTS: {
    status: false,
    errors: {
      code: ERROR_CODES.TRANSACTION_ALREADY_EXISTS,
      error: 'Duplicate. Transaction Already Exist'
    }
  },
  INSUFFICIENT_FUNDS: {
    status: false,
    errors: {
      code: ERROR_CODES.INSUFFICIENT_FUNDS,
      error: 'Insufficient funds to place current wager'
    }
  },
  BETTING_LIMIT_EXCEEDED: {
    status: false,
    errors: {
      code: ERROR_CODES.BETTING_LIMIT_EXCEEDED,
      error: 'Limit exceeded'
    }
  }
}

export const DEVICE_TYPE_MAP = {
  Mobile: [DEVICE_TYPES.MOBILE],
  Desktop: [DEVICE_TYPES.DESKTOP],
  'All device': [DEVICE_TYPES.DESKTOP, DEVICE_TYPES.MOBILE]
}

export const CATEGORIES = {
  Live: 1,
  Slot: 2,
  Virtuals: 3,
  TvGames: 4,
  Poker: 5,
  SportBook: 6
}

export const TOURNAMENT_RESPONSE_MAPPING = {
  [TOURNAMENT_RESPONSE.INSUFFICIENT_FUNDS.code]: casinoErrorTypes.INSUFFICIENT_FUNDS,
  [TOURNAMENT_RESPONSE.INTERNAL_SERVER_ERROR.code]: casinoErrorTypes.UNKNOWN_ERROR,
  [TOURNAMENT_RESPONSE.TOURNAMENT_NOT_FOUND.code]: casinoErrorTypes.TOKEN_EXPIRED,
  [TOURNAMENT_RESPONSE.GAME_NOT_EXIST.code]: casinoErrorTypes.TOKEN_EXPIRED,
  [TOURNAMENT_RESPONSE.TRANSACTION_EXISTS.code]: casinoErrorTypes.TRANSACTION_ALREADY_EXISTS
}
