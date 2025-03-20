

// Payment Handle Types

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

export const PAYMENT_PROVIDER_CATEGORY = {
  INSTANT_BANKING: 'Instant Banking',
  CREDIT_CARD: 'Credit Card',
  CRYPTO: 'Crypto',
  WALLET: 'Wallet',
  VOUCHERS: 'Vouchers',
  OTHER: 'Other'
}

export const PAYMENT_PROVIDERS = {
  COINPAYMENTS: "COINPAYMENT",
  MOONPAY: "MOONPAY"
}

export const MOONPAY_CURRENCY_TO_CURRENCY_SYMBOL = {
 eth: {
  currencySymbol: 'ETH',
  tokenSymbol: 'ETH',
 },
 btc: {
  currencySymbol: 'BTC',
 },
 bnb_bsc: {
  currencySymbol: 'BNB',
  tokenSymbol: 'BSC',
 },
 ltc: {
  currencySymbol: 'LTC',
 },
 usdt: {
  currencySymbol: 'USDT',
  tokenSymbol: 'ERC20',
 },
 usdc: {
  currencySymbol: 'USDC',
  tokenSymbol: 'ERC20',
 },
 trx: {
  currencySymbol: 'TRX',
 },
 xrp: {
  currencySymbol: 'XRP',
 },
 sol: {
  currencySymbol: 'SOL',
 },
 doge: {
  currencySymbol: 'DOGE',
 },
 shib: {
  currencySymbol: 'SHIB',
  tokenSymbol: 'ERC20',
 },
};
