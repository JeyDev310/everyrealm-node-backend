import path from 'path'

export const COOKIE_KEYS = {
  ACCESS_TOKEN: 'AccessToken'
}

export const CACHE_STORE_PREFIXES = {
  BACKEND_CACHE: 'backend-cache:',
  SESSION: 'user-backend-session:',
  USER_BACKEND_CACHE: 'user-backend-cache:'
}

export const JWT_TOKEN_TYPES = {
  PHONE: 'phone',
  VERIFY_EMAIL: 'verify_email',
  FORGOT_PASSWORD: 'forgot_password'
}

export const CACHE_KEYS = {
  BANNERS: 'banners',
  COUNTRIES: 'countries',
  CURRENCIES: 'currencies',
  DOCUMENT_LABELS: 'document_labels',
  ERROR_MESSAGES: 'error_messages',
  LANGUAGES: 'languages',
  PAGES: 'pages',
  SETTINGS: 'settings',
  SPORTS: 'sports',
  TRANSLATIONS: 'translations',
  USER_BACKEND_SESSION_MAP: 'user_backend_session_map',
}

export const USER_FILE_UPLOAD_SERVER_LOCATION = path.join(__dirname, '../../../userUploads')

export const S3_USER_FILE_PATHS = {
  DOCUMENT: 'arc/user/documents',
  PROFILE_IMAGE: 'arc/user/profile_images'
}

export const SETTING_KEYS = {
  LOGO: 'logo',
  CASINO: 'casino',
  GALLERY: 'gallery',
  MAX_ODDS: 'maxOdds',
  MIN_ODDS: 'minOdds',
  SPORTSBOOK: 'sportsbook',
  SITE_LAYOUT: 'siteLayout',
  USER_END_URL: 'userEndUrl',
  MAINTENANCE: 'maintenance',
  ADMIN_END_URL: 'adminEndUrl',
  ALLOW_BETTING: 'allowBetting',
  DEFAULT_SUPPORT: 'defaultSupport',
  MIN_STAKE_AMOUNT: 'minStakeAmount',
  APPLICATION_NAME: 'applicationName',
  EXCHANGE_BET_COMMISSION: 'exchangeBetCommission',
  TOTAL_WITHDRAWALS: 'totalWithdrawals',
  GLOBAL_TOTAL_WITHDRAWAL_LIMIT:'globalTotalWithdrawalLimit',
  PLAYER_TOTAL_WITHDRAWAL_LIMIT:'playerTotalWithdrawalLimit',
  PLAYER_DAILY_TOTAL_WITHDRAWAL_LIMIT:'playerDailyTotalWithdrawalLimit',
  BLOCKED_DOMAINS: 'blockedDomains'
}

// Veriff staus constant
export const VERIFF_STATUS = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  DECLINED: 'declined',
}

export const CUSTOMER_IO_TRANSACTION_ID = {
  VERIFY_MESSAGE_ID: 'email-verification',
  DEPOSIT_SUCCESSFUL_ID :  'depost-successful',
  DEPOSIT_UNSUCESSFUL_ID : 'depost-unsuccessful',
  SUCCESSFUL_DEPOSIT_CONFIRMATION_ID:'successful-deposit-confirmation',
  TELEGRAM_CHANNEL_PROMOTION_ID: 'telegram-channel-promotion',
  EVERY_INFORMATION_PROMOTION_ID:'every-information-promotion',
  KYC_L1_VERIFICATION_ID:'kyc-level1-verification',
  KYC_L2_VERIFICATION_ID : 'kyc-level2-verification',
  KYC_L2_VERIFICATION_RESUBMISSION : 'kyc-level2-verification-resubmission',
  WELCOME_EMAIL_ID : 'welcome-email',
  WITHDRAWAL_PENDING_ID : 'withdrawal-pending',
  WITHDRAWAL_SUCCESSFUL_ID:'withdrawal-successful',
  WITHDRAWAL_UNSUCCESSFUL_ID: 'withdrawal-unsuccessful',
  KYC_L2_VERIFICATION_REQUIED_ID: 'kyc-level2-verification-required',
  WITHDRAW_LIMIT_REACHED_ID: 'withdraw-limit-reached'
}



export class S3FolderHierarchy {
  static #basePath = 'public'

  static get common () {
    return path.join(this.#basePath, 'common')
  }

  static get gallery () {
    return path.join(this.#basePath, 'gallery')
  }

  static get banner () {
    return path.join(this.#basePath, 'banner')
  }

  static get casino () {
    const basePath = path.join(this.#basePath, 'casino')
    return {
      games: path.join(basePath, 'games'),
      providers: path.join(basePath, 'providers'),
      categories: path.join(basePath, 'categories'),
      subCategories: path.join(basePath, 'sub-categoriess')
    }
  }

  static get user () {
    const basePath = path.join(this.#basePath, 'user')
    return {
      documents: path.join(basePath, 'documents'),
      profileImages: path.join(basePath, 'profileImages')
    }
  }
}

export const currecyIdToCode = {
  'ETH': '4',
  'LTC': '2',
  'USDT': '4:0xdac17f958d2ee523a2206206994597c13d831ec7',
  'USDC': '4:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  'TRX': '9',
  'XRP': '36',
  'SOL': '55',
  'DOGE': '6',
  'BNB': '35',
  'BTC': '1',
  'EVERY': '4:0x9afa9999e45484adf5d8eed8d9dfe0693bacd838',
  'SHIB': '4:0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce'
}

export const ADDITIONAL_VERIFICATION_LEVELS = {
  NOT_REQUIRED: 0,
  LEVEL2_REQUIRED: 1,
  LEVEL3_REQUIRED: 2,
  VERIFIED: 3
}

export const WITHDRAWAL_AMOUNT_LEVELS = {
  STATIC_LEVEL1_WITHDRAWAL_LIMIT_IN_EURO: 2000,
  STATIC_LEVEL2_WITHDRAWAL_LIMIT_IN_EURO: 5000
}