// Currency constants start
export const CURRENCY_TYPES = {
  FIAT: 'fiat',
  POINTS: 'point',
  CRYPTO: 'crypto'
}
// Currency constants

// Ledger constants start
export const LEDGER_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit'
}

export const LEDGER_PURPOSE = {
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdraw',
  WINNINGS: 'Winnings',
  COMMISSION: 'Commission',
  CASINO_BET: 'CasinoBet',
  CASINO_WIN: 'CasinoWin',
  CASINO_FREESPIN_WIN: 'CasinoFreespinWin',
  CASINO_REFUND: 'CasinoRefund',
}

export const LEDGER_RULES = {
  [LEDGER_PURPOSE.DEPOSIT]: LEDGER_TYPES.CREDIT,
  [LEDGER_PURPOSE.WITHDRAW]: LEDGER_TYPES.DEBIT,
  [LEDGER_PURPOSE.CASINO_BET]: LEDGER_TYPES.DEBIT,
  [LEDGER_PURPOSE.CASINO_WIN]: LEDGER_TYPES.CREDIT,
  [LEDGER_PURPOSE.CASINO_FREESPIN_WIN]: LEDGER_TYPES.CREDIT,
  [LEDGER_PURPOSE.COMMISSION]: LEDGER_TYPES.CREDIT,
  [LEDGER_PURPOSE.CASINO_REFUND]: LEDGER_TYPES.CREDIT,
}
// Ledger constants end

// AMOUNT_TYPES
export const AMOUNT_TYPES = {
  CASH: 'cash',
}

// Transaction constants start
export const TRANSACTION_STATUS = {
  FAILED: 'failed',
  PENDING: 'pending',
  COMPLETED: 'completed'
}
// Transaction constants end

// Document constants start
export const DOCUMENT_STATUS_TYPES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUESTED: 'requested'
}
// Document constants end

// Setting constants start
export const SETTING_DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  PERCENTAGE: 'percentage',
  JSON: 'json'
}
// Setting constants end

// User constants start
export const USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES = {
  SELF_EXCLUSION: 'self_exclusion',
  DAILY_BET_LIMIT: 'daily_bet_limit',
  WEEKLY_BET_LIMIT: 'weekly_bet_limit',
  MONTHLY_BET_LIMIT: 'monthly_bet_limit',
  DAILY_LOSS_LIMIT: 'daily_loss_limit',
  WEEKLY_LOSS_LIMIT: 'weekly_loss_limit',
  MONTHLY_LOSS_LIMIT: 'monthly_loss_limit',
  DAILY_DEPOSIT_LIMIT: 'daily_deposit_limit',
  WEEKLY_DEPOSIT_LIMIT: 'weekly_deposit_limit',
  MONTHLY_DEPOSIT_LIMIT: 'monthly_deposit_limit'
}

export const SELF_EXCLUSION_TYPES = {
  PERMANENT: 'permanent',
  TEMPORARY: 'temporary'
}

export const USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES = {
  ENUM: 'enum',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  INTEGER: 'integer',
  PERCENTAGE: 'percentage'
}

export const RESPONSIBLE_GAMBLING_DATA_TYPE_MAPPING = {
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.SELF_EXCLUSION]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.ENUM,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_BET_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.INTEGER,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_BET_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.INTEGER,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_BET_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.INTEGER,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_DEPOSIT_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.NUMBER,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_DEPOSIT_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.NUMBER,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_DEPOSIT_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.NUMBER,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_LOSS_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.NUMBER,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_LOSS_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.NUMBER,
  [USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_LOSS_LIMIT]: USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES.NUMBER
}

export const USER_GENDER = {
  MALE: 'male',
  FEMALE: 'female'
}
// User constants end

// Withdrawal constants start
export const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed',
  SUCCESS: 'success',
  FAILED: 'failed'
}

export const WITHDRAWAL_TYPES = {
  BANK: 'bank',
  CRYPTO: 'crypto'
}
// Withdrawal constants end

// Email template constants start
export const EMAIL_TEMPLATE_EVENT_TYPES = {
  WELCOME: 'welcome',
  ACTIVE_USER: 'active_user',
  INACTIVE_USER: 'inactive_user',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_PASSWORD: 'reset_password',
  EMAIL_VERIFICATION: 'email_verification',
  DOCUMENT_REJECTED: 'document_rejected',
  DOCUMENT_REMINDER: 'document_reminder',
  DOCUMENT_RECEIVED: 'document_received',
  DOCUMENT_VERIFIED: 'document_verified',
  DOCUMENT_REQUESTED: 'document_requested',
  KYC_ACTIVATED: 'kyc_activated',
  KYC_DEACTIVATED: 'kyc_deactivated',
  WITHDRAW_PROCESSED: 'withdraw_processed',
  WITHDRAW_REQUEST_RECEIVED: 'withdraw_request_received',
  WITHDRAW_REQUEST_APPROVED: 'withdraw_request_approved',
  DEPOSIT_FAILED: 'deposit_failed',
  DEPOSIT_SUCCESS: 'deposit_success',
  GAMBLING_REGISTRATION: 'gambling_registration',
  PASSWORD_UPDATED: 'password_updated'
}
// Email template constants end

// Banner constants start
export const BANNER_TYPES = {
  HOME_MAIN_BANNER: 'home_main_banner',
  HOME_LEFT_BANNER: 'home_left_banner',
  HOME_RIGHT_BANNER: 'home_right_banner',
  HOME_LOGOUT_MAIN_BANNER: 'home_logout_main_banner',
  HOME_LOGOUT_CAROUSEL_BANNER_1: 'home_logout_carousel_banner_1',
  HOME_LOGOUT_CAROUSEL_BANNER_2: 'home_logout_carousel_banner_2',
  HOME_LOGOUT_CAROUSEL_BANNER_3: 'home_logout_carousel_banner_3',
  HOME_LOGOUT_CAROUSEL_BANNER_4: 'home_logout_carousel_banner_4',
  HOME_LOGOUT_CAROUSEL_BANNER_5: 'home_logout_carousel_banner_5',
  HOME_LOGOUT_CAROUSEL_BANNER_6: 'home_logout_carousel_banner_6',
  HOME_LOGOUT_CAROUSEL_BANNER_7: 'home_logout_carousel_banner_7',
  HOME_LOGOUT_CAROUSEL_BANNER_8: 'home_logout_carousel_banner_8',
  HOME_LOGOUT_CAROUSEL_BANNER_9: 'home_logout_carousel_banner_9',
  HOME_LOGOUT_CAROUSEL_BANNER_10: 'home_logout_carousel_banner_10',
  HOME_LOGIN_CAROUSEL_BANNER_1: 'home_login_carousel_banner_1',
  HOME_LOGIN_CAROUSEL_BANNER_2: 'home_login_carousel_banner_2',
  HOME_LOGIN_CAROUSEL_BANNER_3: 'home_login_carousel_banner_3',
  HOME_LOGIN_CAROUSEL_BANNER_4: 'home_login_carousel_banner_4',
  HOME_LOGIN_CAROUSEL_BANNER_5: 'home_login_carousel_banner_5',
  HOME_LOGIN_CAROUSEL_BANNER_6: 'home_login_carousel_banner_6',
  HOME_LOGIN_CAROUSEL_BANNER_7: 'home_login_carousel_banner_7',
  HOME_LOGIN_CAROUSEL_BANNER_8: 'home_login_carousel_banner_8',
  HOME_LOGIN_CAROUSEL_BANNER_9: 'home_login_carousel_banner_9',
  HOME_LOGIN_CAROUSEL_BANNER_10: 'home_login_carousel_banner_10',
  PROMOTIONS_MAIN_BANNER: 'promotions_main_banner',
  PROMOTIONS_LEFT_BANNER: 'promotions_left_banner',
  PROMOTIONS_RIGHT_BANNER: 'promotions_right_banner',
  CASINO: 'casino',
  LOYALITY: 'loyality',
  PROMOTIONS: 'promotions',
  SPORTSBOOK: 'sportsbook'
}
// Banner constants end

// Wager constants start
export const WAGER_STATUS = {
  NOT_STARTED: 1,
  ONGOING: 2,
  COMPLETED: 3
}
