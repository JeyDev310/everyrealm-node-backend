import { PaymentProvider } from './paymentProviders'
import { ProviderLimit } from './providerLimits'
import { CryptoWalletAddress } from './cryptoWalletsAddress'
import { UsersDepositAddress } from './usersDepositAddress'
import { CryptoToken } from './cryptoToken'

/** @type {[typeof import('sequelize').Model]} */
export const models = [
  PaymentProvider,
  ProviderLimit,
  CryptoWalletAddress,
  UsersDepositAddress,
  CryptoToken
]
