const explorers = {
    BTC: 'https://www.blockchain.com/btc/tx/', // Bitcoin
    ETH: 'https://etherscan.io/tx/', // Ethereum (ERC20)
    'ETH.BEP20': 'https://bscscan.com/tx/', // Ethereum (BP20)
    LTC: 'https://blockchair.com/litecoin/transaction/', // Litecoin
    'USDT.ERC20': 'https://etherscan.io/tx/', // USDT (ERC20)
    'USDT.BEP20': 'https://bscscan.com/tx/', // USDT (BEP20)
    'USDT.TRC20': 'https://tronscan.org/#/transaction/', // USDT (TRC20)
    'USDT.MATIC': 'https://polygonscan.com/tx/', // USDT (MATIC)
    'USDC.ERC20': 'https://etherscan.io/tx/', // USDC (ERC20)
    'USDC.BEP20': 'https://bscscan.com/tx/', // USDC (BEP20)
    'USDC.SOL': 'https://solscan.io/tx/', // USDC (SOL)
    TRX: 'https://tronscan.org/#/transaction/', // Tron
    MATIC: 'https://polygonscan.com/tx/', // MATIC (Polygon)
    XRP: 'https://xrpscan.com/tx/', // Ripple
    SOL: 'https://solscan.io/tx/', // Solana
    DOGE: 'https://blockchair.com/dogecoin/transaction/', // Dogecoin
    'BNB.BSC': 'https://bscscan.com/tx/', // Binance Coin
    'SHIB.ERC20': 'https://etherscan.io/tx/', // Shiba Inu (ERC20)
    BONK: 'https://solscan.io/tx/', // Bonk (Solana)
    'EVERY.ERC20': 'https://etherscan.io/tx/',
    'EVERY.BASE': 'https://basescan.org/tx/',
  };
  
  export const transactionExplorerUrlGenerator = (txHash, currencySymbol) => {
    if (explorers?.[currencySymbol]) {
      return `${explorers?.[currencySymbol]}${txHash}`;
    } else {
      return `https://blockexplorer.one/?q=${txHash}`;
    }
  };