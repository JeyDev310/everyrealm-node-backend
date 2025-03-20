export const convertFiatToCrypto = (fiatAmount, exchangeRate) => {
  const cryptoAmount = fiatAmount * exchangeRate
  return cryptoAmount
}

export const convertCryptoToFiat = (cryptoAmount, exchangeRate) => {
  const fiatAmount = cryptoAmount / exchangeRate
  return fiatAmount
}
