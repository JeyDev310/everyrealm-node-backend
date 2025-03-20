import { StatusCodes } from 'http-status-codes'

export const messages = {
  PLEASE_CHECK_REQUEST_DATA: 'PLEASE_CHECK_REQUEST_DATA',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  RESPONSE_VALIDATION_FAILED: 'RESPONSE_VALIDATION_FAILED',
  SOCKET_PROVIDE_PROPER_ARGUMENTS: 'SOCKET_PROVIDE_PROPER_ARGUMENTS',
  ACCESS_TOKEN_INVALID_EXPIRED_OR_NOT_PASSED: 'ACCESS_TOKEN_INVALID_EXPIRED_OR_NOT_PASSED',
  USER_DOES_NOT_EXISTS: 'USER_DOES_NOT_EXISTS',
  CANCEL_SUCCESS: 'Cancelled',
  USER_INACTIVE: 'USER_INACTIVE',
  GAME_INACTIVE: 'GAME_INACTIVE',
  WRONG_PASSWORD: 'WRONG_PASSWORD',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  USERNAME_OR_EMAIL_ALREADY_EXISTS: 'USERNAME_OR_EMAIL_ALREADY_EXISTS',
  USER_NOT_LOGGED_IN: 'USER_NOT_LOGGED_IN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  USERNAME_IS_TAKEN: 'USERNAME_IS_TAKEN',
  PHONE_IS_TAKEN: 'PHONE_IS_TAKEN',
  LIMIT_NOT_FOUND: 'LIMIT_NOT_FOUND',
  INVALID_TIME_UNIT: 'INVALID_TIME_UNIT',
  INVALID_VALUE: 'INVALID_VALUE',
  EXCLUDED_PERMANENTLY_PLEASE_CONTACT_PROVIDER: 'EXCLUDED_PERMANENTLY_PLEASE_CONTACT_PROVIDER',
  INVALID_EVENT_ID_COMBINATION: 'INVALID_EVENT_ID_COMBINATION',
  INVALID_WALLET_ID: 'INVALID_WALLET_ID',
  NOT_ENOUGH_AMOUNT: 'NOT_ENOUGH_AMOUNT',
  ACCESS_TOKEN_NOT_FOUND: 'ACCESS_TOKEN_NOT_FOUND',
  BETTING_IS_DIABLED: 'BETTING_IS_DIABLED',
  MIN_STAKE_REQUIRED: 'MIN_STAKE_REQUIRED',
  ODDS_SHULD_BE_IN_RANGE: 'ODDS_SHULD_BE_IN_RANGE',
  INVALID_SPORT_ID: 'INVALID_SPORT_ID',
  YOUR_COUNTRY_IS_NOT_LISTED: 'YOUR_COUNTRY_IS_NOT_LISTED',
  EXCLUDED_TEMPORARILY: 'EXCLUDED_TEMPORARILY',
  INVALID_ADDRESS_ID: 'INVALID_ADDRESS_ID',
  INVALID_TOKEN: 'INVALID_TOKEN',
  WRONG_TOKEN_TYPE: 'WRONG_TOKEN_TYPE',
  FILE_DOES_NOT_EXISTS: 'FILE_DOES_NOT_EXISTS',
  INVALID_DOCUMENT_LABEL_ID: 'INVALID_DOCUMENT_LABEL_ID',
  DOCUMENT_IS_APPROVED: 'DOCUMENT_IS_APPROVED',
  INVALID_DOCUMENT_ID: 'INVALID_DOCUMENT_ID',
  CASHOUT_NOT_ALLOWED: 'CASHOUT_NOT_ALLOWED',
  FILE_FORMAT_NOT_SUPPORTED: 'FILE_FORMAT_NOT_SUPPORTED',
  DAILY_BET_LIMIT_EXCEEDED: 'DAILY_BET_LIMIT_EXCEEDED',
  WEEKLY_BET_LIMIT_EXCEEDED: 'WEEKLY_BET_LIMIT_EXCEEDED',
  MONTHLY_BET_LIMIT_EXCEEDED: 'MONTHLY_BET_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  CURRENCY_NOT_AVAILABLE: 'CURRENCY_NOT_AVAILABLE',
  BLOCKED_TRANSACTION: 'BLOCKED_TRANSACTION',
  ADDRESS_ALREADY_EXISTS: 'ADDRESS_ALREADY_EXISTS',
  TRANSACTION_ALREADY_EXISTS: 'TRANSACTION_ALREADY_EXISTS',
  TOURNAMENT_DOES_NOT_EXISTS: 'TOURNAMENT_DOES_NOT_EXISTS',
  TOURNAMENT_NOT_ACTIVE: 'TOURNAMENT_NOT_ACTIVE',
  TOURNAMENT_REGISTRATION_CLOSE: 'TOURNAMENT_REGISTRATION_CLOSE',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  USER_ALREADY_ENROLLED_IN_TOURNAMENT: 'USER_ALREADY_ENROLLED_IN_TOURNAMENT',
  USER_ALREADY_NOT_ENROLLED_IN_TOURNAMENT: 'USER_ALREADY_NOT_ENROLLED_IN_TOURNAMENT',
  TOURNAMENT_PLAYER_LIMIT_REACHED: 'TOURNAMENT_PLAYER_LIMIT_REACHED',
  TOURNAMENT_REBUY_LIMIT_REACHED: 'TOURNAMENT_REBUY_LIMIT_REACHED',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
  ADDRESS_ALREADY_EXISTS: 'ADDRESS_ALREADY_EXISTS',
  VERIFF_ALREADY_VERIFIED: 'VERIFF_ALREADY_VERIFIED',
  DEPOSIT_NOT_ALLOWED: 'DEPOSIT_NOT_ALLOWED',
  MINIMUM_DEPOSIT_NOT_ALLOWED: 'MINIMUM_DEPOSIT_NOT_ALLOWED',
  MAXIMUM_DEPOSIT_NOT_ALLOWED: 'MAXIMUM_DEPOSIT_NOT_ALLOWED',
  WITHDRAW_NOT_ALLOWED: 'WITHDRAW_NOT_ALLOWED',
  MINIMUM_WITHDRAW_NOT_ALLOWED: 'MINIMUM_WITHDRAW_NOT_ALLOWED',
  MAXIMUM_WITHDRAW_NOT_ALLOWED: 'MAXIMUM_WITHDRAW_NOT_ALLOWED',
  PAYMENT_PROVIDER_NOT_FOUND: 'PAYMENT_PROVIDER_NOT_FOUND',
  NOTIFICATION_SUBSCRIPTION_EXIST: 'NOTIFICATION_SUBSCRIPTION_EXIST',
  PAYMENT_ERROR: 'PAYMENT_ERROR_PLEASE_CONTACT_ADMIN',
  PROMO_CODE_EXPIRED: 'PROMO_CODE_EXPIRED',
  LEVEL_2_REQUIRED: 'LEVEL_2_REQUIRED',
  LEVEL_3_REQUIRED: 'LEVEL_3_REQUIRED',
  HMAC_DOES_NOT_MATCH: 'HMAC_DOES_NOT_MATCH',
  AMOUNT_BELOW_MINIMUM_WITHDRAWAL_AMOUNT: 'AMOUNT_BELOW_MINIMUM_WITHDRAWAL_AMOUNT',
  DEPOSIT_LIMIT_EXCEED: 'DEPOSIT_LIMIT_EXCEED',
  BET_LIMIT_EXCEED: 'BET_LIMIT_EXCEED',
  INVALID_WALLET_ADDRESS: 'Invalid wallet address',
  REWARD_NOT_FOUND: 'REWARD_NOT_FOUND',
  SENSITIVE_INFORMATION_IN_REQUEST_BODY: 'SENSITIVE_INFORMATION_IN_REQUEST_BODY - Please do not include userId or privyId (or any other such IDs) in the request body',
  EMAIL_OR_USERNAME_NOT_SET: 'EMAIL_OR_USERNAME_NOT_SET - Please ensure you have a username and email associated with your account',
  PLAYER_CREATION_FAILED: 'PLAYER_CREATION_FAILED - Failed to create Player in MyAffiliates. Please contact support',
  AFFILIATE_STATUS_UPDATE_FAILED: 'AFFILIATE_STATUS_UPDATE_FAILED - Affiliate status will remain in Pending state. Please contact support',
  AFFILIATE_RETRIEVAL_FAILED: 'AFFILIATE_RETRIEVAL_FAILED - Cannot retrieve User affiliate code. Please contact support',
  WITHDRAWAL_LIMIT_EXCEEDED: 'WITHDRAWAL_LIMIT_EXCEEDED',
  MOONPAY_SIGNATURE_ERROR: 'MOONPAY_SIGNATURE_ERROR',
}

export const errorTypes = {
  RequestInputValidationErrorType: {
    name: 'RequestInputValidationError',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: 'Invalid request data', // messages.PLEASE_CHECK_REQUEST_DATA,
    errorCode: 3001
  },
  SiteUnderMaintenanceErrorType: {
    name: 'SiteUnderMaintenanceError',
    statusCode: StatusCodes.SERVICE_UNAVAILABLE,
    isOperational: true,
    description: 'Invalid request data', // messages.PLEASE_CHECK_REQUEST_DATA,
    errorCode: 3001
  },
  WithdrawalNotAllowedErrorType: {
    name: 'WithdrawalNotAllowedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: 'You are not allowed to make withdrawal', // messages.PLEASE_CHECK_REQUEST_DATA,
    errorCode: 3001
  },
  ResponseValidationErrorType: {
    name: 'ResponseInputValidationError',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: false,
    description: messages.RESPONSE_VALIDATION_FAILED,
    errorCode: 3002
  },
  SocketRequestInputValidationErrorType: {
    name: 'SocketRequestInputValidationError',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.PLEASE_CHECK_REQUEST_DATA,
    errorCode: 3003
  },
  SocketResponseValidationErrorType: {
    name: 'SocketResponseValidationError',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: false,
    description: messages.RESPONSE_VALIDATION_FAILED,
    errorCode: 3004
  },
  InternalServerErrorType: {
    name: 'InternalServerError',
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    isOperational: true,
    description: messages.INTERNAL_SERVER_ERROR,
    errorCode: 3005
  },
  InvalidSocketArgumentErrorType: {
    name: 'InvalidSocketArgumentError',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.SOCKET_PROVIDE_PROPER_ARGUMENTS,
    errorCode: 3006
  },
  AuthenticationErrorType: {
    name: 'AuthenticationErrorType',
    statusCode: StatusCodes.UNAUTHORIZED,
    isOperational: true,
    description: messages.ACCESS_TOKEN_INVALID_EXPIRED_OR_NOT_PASSED,
    errorCode: 3007
  },
  UserDoesNotExistsErrorType: {
    name: 'UserDoesNotExistsErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.USER_DOES_NOT_EXISTS,
    errorCode: 3008
  },
  serviceErrorType: {
    name: 'serviceErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: false,
    description: messages.SERVICE_UNAVAILABLE,
    errorCode: 3009
  },
  CancelSuccessErrorType: {
    name: 'CancelSuccessErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.CANCEL_SUCCESS,
    errorCode: 3010
  },
  UserInactiveErrorType: {
    name: 'UserInactiveErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.USER_INACTIVE,
    errorCode: 3011
  },
  WrongPasswordErrorType: {
    name: 'WrongPasswordErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WRONG_PASSWORD,
    errorCode: 3012
  },
  EmailNotVerifiedErrorType: {
    name: 'EmailNotVerifiedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.EMAIL_NOT_VERIFIED,
    errorCode: 3013
  },
  UsernameOrEmailAlreadyExistsErrorType: {
    name: 'UsernameOrEmailAlreadyExistsErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.USERNAME_OR_EMAIL_ALREADY_EXISTS,
    errorCode: 3014
  },
  UserNotLoggedInErrorType: {
    name: 'UserNotLoggedInErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.USER_NOT_LOGGED_IN,
    errorCode: 3015
  },
  SessionExpiredErrorType: {
    name: 'SessionExpiredErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.SESSION_EXPIRED,
    errorCode: 3016
  },
  UsernameIsTakenErrorType: {
    name: 'UsernameIsTakenErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.USERNAME_IS_TAKEN,
    errorCode: 3017
  },
  PhoneIsTakenErrorType: {
    name: 'PhoneIsTakenErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.PHONE_IS_TAKEN,
    errorCode: 3018
  },
  LimitNotFoundErrorType: {
    name: 'LimitNotFoundErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.LIMIT_NOT_FOUND,
    errorCode: 3019
  },
  InvalidTimeUnitErrorType: {
    name: 'InvalidTimeUnitErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_TIME_UNIT,
    errorCode: 3020
  },
  InvalidValueErrorType: {
    name: 'InvalidValueErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_VALUE,
    errorCode: 3021
  },
  ExcludedPermanentlyPleaseContactProviderErrorType: {
    name: 'ExcludedPermanentlyPleaseContactProviderErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.EXCLUDED_PERMANENTLY_PLEASE_CONTACT_PROVIDER,
    errorCode: 3022
  },
  InvalidEventIdCombinationErrorType: {
    name: 'InvalidEventIdCombinationErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_EVENT_ID_COMBINATION,
    errorCode: 3023
  },
  InvalidWalletIdErrorType: {
    name: 'InvalidWalletIdErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_WALLET_ID,
    errorCode: 3024
  },
  NotEnoughAmountErrorType: {
    name: 'NotEnoughAmountErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.NOT_ENOUGH_AMOUNT,
    errorCode: 3025
  },
  AccessTokenNotFoundErrorType: {
    name: 'AccessTokenNotFoundErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.ACCESS_TOKEN_NOT_FOUND,
    errorCode: 3026
  },
  BettingIsDiabledErrorType: {
    name: 'BettingIsDiabledErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.BETTING_IS_DIABLED,
    errorCode: 3027
  },
  MinStakeRequiredErrorType: {
    name: 'MinStakeRequiredErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.MIN_STAKE_REQUIRED,
    errorCode: 3028
  },
  OddsShuldBeInRangeErrorType: {
    name: 'OddsShuldBeInRangeErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.ODDS_SHULD_BE_IN_RANGE,
    errorCode: 3029
  },
  InvalidSportIdErrorType: {
    name: 'InvalidSportIdErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_SPORT_ID,
    errorCode: 3030
  },
  YourCountryIsNotListedErrorType: {
    name: 'YourCountryIsNotListedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.YOUR_COUNTRY_IS_NOT_LISTED,
    errorCode: 3031
  },
  ExcludedTemporarilyErrorType: {
    name: 'ExcludedTemporarilyErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.EXCLUDED_TEMPORARILY,
    errorCode: 3033
  },
  InvalidAddressIdErrorType: {
    name: 'InvalidAddressIdErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_ADDRESS_ID,
    errorCode: 3034
  },
  InvalidTokenErrorType: {
    name: 'InvalidTokenErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_TOKEN,
    errorCode: 3035
  },
  WrongTokenTypeErrorType: {
    name: 'WrongTokenTypeErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WRONG_TOKEN_TYPE,
    errorCode: 3036
  },
  FileDoesNotExistsErrorType: {
    name: 'FileDoesNotExistsErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.FILE_DOES_NOT_EXISTS,
    errorCode: 3037
  },
  InvalidDocumentLabelIdErrorType: {
    name: 'InvalidDocumentLabelIdErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_DOCUMENT_LABEL_ID,
    errorCode: 3038
  },
  DocumentIsApprovedErrorType: {
    name: 'DocumentIsApprovedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.DOCUMENT_IS_APPROVED,
    errorCode: 3039
  },
  InvalidDocumentIdErrorType: {
    name: 'InvalidDocumentIdErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_DOCUMENT_ID,
    errorCode: 3040
  },
  CashoutNotAllowedErrorType: {
    name: 'CashoutNotAllowedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.CASHOUT_NOT_ALLOWED,
    errorCode: 3043
  },
  FileFormatNotSupportedErrorType: {
    name: 'FileFormatNotSupportedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.FILE_FORMAT_NOT_SUPPORTED,
    errorCode: 3044
  },
  DailyBetLimitExceededErrorType: {
    name: 'DailyBetLimitExceededErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.DAILY_BET_LIMIT_EXCEEDED,
    errorCode: 3045
  },
  WeeklyBetLimitExceededErrorType: {
    name: 'WeeklyBetLimitExceededErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WEEKLY_BET_LIMIT_EXCEEDED,
    errorCode: 3046
  },
  MonthlyBetLimitExceededErrorType: {
    name: 'MonthlyBetLimitExceededErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.MONTHLY_BET_LIMIT_EXCEEDED,
    errorCode: 3047
  },
  ServiceUnavailableErrorType: {
    name: 'ServiceUnavailableErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.SERVICE_UNAVAILABLE,
    errorCode: 3048
  },
  BlockedTransactionErrorType: {
    name: 'BlockedTransactionErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.BLOCKED_TRANSACTION,
    errorCode: 3049
  },
  AddressAlreadyExistsErrorType: {
    name: 'AddressAlreadyExistsErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.ADDRESS_ALREADY_EXISTS,
    errorCode: 3050
  },
  TournamentDoesNotExistErrorType: {
    name: 'TournamentDoesNotExistErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.TOURNAMENT_DOES_NOT_EXISTS,
    errorCode: 3049
  },
  TournamentNotActiveErrorType: {
    name: 'TournamentNotActiveErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.TOURNAMENT_NOT_ACTIVE,
    errorCode: 3050
  },
  RegistrationEndDateErrorType: {
    name: 'RegistrationEndDateErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.TOURNAMENT_REGISTRATION_CLOSE,
    errorCode: 3051
  },
  BalanceErrorType: {
    name: 'BalanceErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INSUFFICIENT_BALANCE,
    errorCode: 3053
  },
  TournamentsAlreadyEnrolledErrorType: {
    name: 'TournamentsAlreadyEnrolledErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.USER_ALREADY_ENROLLED_IN_TOURNAMENT,
    errorCode: 3054
  },
  TournamentPlayerLimitReachedErrorType: {
    name: 'TournamentPlayerLimitReachedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.TOURNAMENT_PLAYER_LIMIT_REACHED,
    errorCode: 3055
  },
  NoRebuyLimitErrorType: {
    name: 'NoRebuyLimitErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.TOURNAMENT_REBUY_LIMIT_REACHED,
    errorCode: 3056
  },
  NotEnrolledInTournamentErrorType: {
    name: 'NotEnrolledInTournamentErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.USER_ALREADY_NOT_ENROLLED_IN_TOURNAMENT,
    errorCode: 3055
  },
  EmailAlreadyVerifiedErrorType: {
    name: 'EmailAlreadyVerifiedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.EMAIL_ALREADY_VERIFIED,
    errorCode: 3052
  },
  InvalidAggregatorType: {
    name: 'InvalidAggregatorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_AGGREGATOR_TYPE,
    errorCode: 3027
  },
  TransactionAlreadyExistsErrorType: {
    name: 'TransactionAlreadyExistsErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.TRANSACTION_ALREADY_EXISTS,
    errorCode: 3028
  },
  VeriffAlreadyVerifiedErrorType: {
    name: 'VeriffAlreadyVerifiedErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.VERIFF_ALREADY_VERIFIED,
    errorCode: 3052
  },
  NotificationSubscriptionExistErrorType: {
    name: 'NotificationSubscriptionExistErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.NOTIFICATION_SUBSCRIPTION_EXIST,
    errorCode: 3053
  },
  PaymentGatewayErrorType: {
    name: 'SomePaymentErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.PAYMENT_ERROR,
    errorCode: 3054
  },
  CurrencyNotAvailableErrorType: {
    name: 'CurrencyNotAvailableErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.CURRENCY_NOT_AVAILABLE,
    errorCode: 3055
  },
  PromoCodeExpiredErrorType: {
    name: 'PromoCodeExpiredErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.PROMO_CODE_EXPIRED,
    errorCode: 3058
  },
  Level2RequiredErrorType: {
    name: 'Level2RequiredErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.LEVEL_2_REQUIRED,
    errorCode: 3059
  },
  Level3RequiredErrorType: {
    name: 'Level3RequiredErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.LEVEL_3_REQUIRED,
    errorCode: 3060
  },
  HmacDoesNotMatchErrorType: {
    name: 'HmacDoesNotMatchErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.HMAC_DOES_NOT_MATCH,
    errorCode: 3061
  },
  PlayerReachedCustomizedDepositLimit: {
    name: 'PlayerReachedCustomizedDepositLimit',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.DEPOSIT_LIMIT_EXCEED,
    errorCode: 3060
  },
  PlayerReachedCustomizedBetLimit: {
    name: 'PlayerReachedCustomizedBetLimit',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.BET_LIMIT_EXCEED,
    errorCode: 3061
  },
  GameInactiveErrorType: {
    name: 'GameInactiveErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.GAME_INACTIVE,
    errorCode: 3063
  },
  SensitiveInformationInRequestBodyErrorType: {
    name: 'SensitiveInformationInRequestBodyErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.SENSITIVE_INFORMATION_IN_REQUEST_BODY,
    errorCode: 3064
  },
  EmailOrUsernameNotSetErrorType: {
    name: 'EmailOrUsernameNotSetErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.EMAIL_OR_USERNAME_NOT_SET,
    errorCode: 3066
  },
  PlayerCreationErrorType: {
    name: 'PlayerCreationErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.PLAYER_CREATION_FAILED,
    errorCode: 3067
  },
  AffiliateStatusUpdateErrorType: {
    name: 'AffiliateStatusUpdateErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.AFFILIATE_STATUS_UPDATE_FAILED,
    errorCode: 3068
  },
  AffiliateRetrievalErrorType: {
    name: 'AffiliateRetrievalErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.AFFILIATE_RETRIEVAL_FAILED,
    errorCode: 3069
  },
  WithdrawalLimitExceededErrorType: {
    name: 'WithdrawalLimitExceededErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WITHDRAWAL_LIMIT_EXCEEDED,
    errorCode: 3087
  },
  WithdrawalLimitForAllCurrenciesExceededErrorType: {
    name: 'WithdrawalLimitForAllCurrenciesExceededErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WITHDRAWAL_LIMIT_EXCEEDED,
    errorCode: 3088
  },
  AllCurrenciesWithdrawalLimitExceededErrorType: {
    name: 'AllCurrenciesWithdrawalLimitExceededErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WITHDRAWAL_LIMIT_EXCEEDED,
    errorCode: 3089
  },
  AllCurrenciesDailyWithdrawalLimitExceededErrorType: {
    name: 'AllCurrenciesDailyWithdrawalLimitExceededErrorType', 
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WITHDRAWAL_LIMIT_EXCEEDED,
    errorCode: 3090
  },
  CurrencySpecificWithdrawalLimitExceededErrorType: {
    name: 'CurrencySpecificWithdrawalLimitExceededErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WITHDRAWAL_LIMIT_EXCEEDED,
    errorCode: 3091
  },
  CurrencySpecificDailyWithdrawalLimitExceededErrorType: {
    name: 'CurrencySpecificDailyWithdrawalLimitExceededErrorType',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.WITHDRAWAL_LIMIT_EXCEEDED,
    errorCode: 3092
  },
  InvalidPaymentAddress: {
    name: 'InvalidPaymentAddress',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_WALLET_ADDRESS,
    errorCode: 3094
  },
  LinkedWalletAddressNotFoundError: {
    name: 'LinkedWalletAddressNotFoundError',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.INVALID_WALLET_ADDRESS,
    errorCode: 3095
  },
  MoonpaySignatureError: {
    name: 'MoonpaySignatureError',
    statusCode: StatusCodes.BAD_REQUEST,
    isOperational: true,
    description: messages.MOONPAY_SIGNATURE_ERROR,
    errorCode: 3096
  },

}
