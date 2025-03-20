import convict from 'convict'
import dotenv from 'dotenv'
import fs from 'fs'

if (fs.existsSync('.env')) {
  const envConfig = dotenv.parse(fs.readFileSync('.env'))

  for (const key in envConfig) {
    process.env[key] = envConfig[key]
  }
}

const config = convict({
  app: {
    name: {
      doc: 'User backend',
      format: String,
      default: 'User backend'
    },
    userFeUrl: {
      doc: 'User Frontend Url',
      format: String,
      default: 'User Frontend Url',
      env: 'USER_FE_URL'
    },
    userBeUrl: {
      doc: 'User Backend Url',
      format: String,
      default: 'User Backend Url',
      env: 'USER_BE_URL'
    }
  },

  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'staging', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },

  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 4000,
    env: 'PORT'
  },

  log_level: {
    doc: 'level of logs to show',
    format: String,
    default: 'debug',
    env: 'LOG_LEVEL'
  },

  internanl_basic_auth: {
    username: {
      doc: 'Basic auth username for internal service communication',
      format: String,
      default: 'username',
      env: 'INTERNAL_BASIC_AUTH_USERNAME'
    },
    password: {
      doc: 'Basic auth password for internal service communication',
      format: String,
      default: 'password',
      env: 'INTERNAL_BASIC_AUTH_PASSWORD'
    }
  },

  session: {
    secret: {
      doc: 'Session secret',
      format: String,
      default: 'secret',
      env: 'SESSION_SECRET'
    },
    expiry: {
      doc: 'Global session expiry time in milliseconds',
      format: Number,
      default: '172800000', // 2 days
      env: 'SESSION_EXPIRY'
    }
  },

  bcrypt: {
    salt: {
      doc: 'Salt var for bcrypt to hash the message',
      format: Number,
      default: 10,
      env: 'BCRYPT_SALT'
    }
  },

  db: {
    name: {
      doc: 'Database Name',
      format: String,
      default: 'api',
      env: 'DB_NAME'
    },
    username: {
      doc: 'Database user',
      format: String,
      default: 'postgres',
      env: 'DB_USERNAME'
    },
    password: {
      doc: 'Database password',
      format: '*',
      default: 'postgres',
      env: 'DB_PASSWORD'
    },
    host: {
      doc: 'DB host',
      format: String,
      default: '127.0.0.1',
      env: 'DB_HOST'
    },
    port: {
      doc: 'DB PORT',
      format: 'port',
      default: '5432',
      env: 'DB_PORT'
    },
    logging: {
      doc: 'Database query logging',
      format: Boolean,
      default: true,
      env: 'DB_LOGGING'
    }
  },

  slave_db: {
    name: {
      doc: 'Slave Database Name',
      format: String,
      default: 'api',
      env: 'SLAVE_DB_NAME'
    },
    username: {
      doc: 'Slave Database user',
      format: String,
      default: 'postgres',
      env: 'SLAVE_DB_USERNAME'
    },
    password: {
      doc: 'Slave Database password',
      format: '*',
      default: 'postgres',
      env: 'SLAVE_DB_PASSWORD'
    },
    host: {
      doc: 'Slave DB host',
      format: String,
      default: '127.0.0.1',
      env: 'SLAVE_DB_HOST'
    },
    port: {
      doc: 'Slave DB PORT',
      format: 'port',
      default: '5432',
      env: 'SLAVE_DB_PORT'
    }
  },

  pub_sub_redis_db: {
    password: {
      doc: 'Redis Database password',
      format: '*',
      default: '',
      env: 'PUB_SUB_REDIS_DB_PASSWORD'
    },
    host: {
      doc: 'Redis DB host',
      format: String,
      default: '127.0.0.1',
      env: 'PUB_SUB_REDIS_DB_HOST'
    },
    port: {
      doc: 'Redis DB PORT',
      format: 'port',
      default: 6379,
      env: 'PUB_SUB_REDIS_DB_PORT'
    }
  },

  jwt: {
    secret: {
      doc: 'JWT secret key',
      format: String,
      default: 'secret',
      env: 'JWT_SECRET'
    },
    expiry: {
      doc: 'JWT token expiration time',
      format: String,
      default: '2d',
      env: 'JWT_EXPIRY'
    }
  },

  aws: {
    bucket: {
      doc: 'Aws bucket name',
      format: String,
      default: '',
      env: 'AWS_S3_BUCKET'
    },
    region: {
      doc: 'Aws region',
      format: String,
      default: 'us-east-1',
      env: 'AWS_S3_REGION'
    },
  },

  cors: {
    doc: 'Frontend endpoints to enable for cors setting',
    format: String,
    default: '',
    env: 'CORS'
  },
  original: {
    crashUrl: {
      doc: 'Crash game endpoint',
      format: String,
      default: 'http://originals-crash-service:8080/originals/crash-service/v1',
      env: 'CRASH_GAME_ENDPOINT_URL'
    },
    plinkoUrl: {
      doc: 'Plinko game endpoint',
      format: String,
      default: 'http://originals-plinko-service:8080/originals/plinko-service/v1',
      env: 'PLINKO_GAME_ENDPOINT_URL'
    },
    blshUrl: {
      doc: 'Blsh game endpoint',
      format: String,
      default: 'http://originals-blsh-service:8080/originals/blsh-service/v1',
      env: 'BLSH_GAME_ENDPOINT_URL'
    },
    accessToken: {
      doc: 'Basic auth username for originals service communication',
      format: String,
      default: 'username',
      env: 'ORIGINAL_ACCESS_TOKEN'
    },
  },
  casino_soft_swiss_aggregator: {
    gcpUrl: {
      doc: 'Casino Aggregator endpoint',
      format: String,
      default: 'http://localhost:8080',
      env: 'CASINO_SOFT_SWISS_AGGREGATOR_GCP_URL'
    },
    accessToken: {
      doc: 'Basic auth username for casino aggregator service communication',
      format: String,
      default: 'username',
      env: 'CASINO_SOFT_SWISS_AGGREGATOR_ACCESS_TOKEN'
    },
    casinoId: {
      doc: 'Basic auth username for casino aggregator service communication',
      format: String,
      default: 'username',
      env: 'CASINO_SOFT_SWISS_AGGREGATOR_CASINO_ID'
    }
  },

  mailjet: {
    apiKey: {
      doc: 'Mailjet API key',
      format: String,
      default: '',
      env: 'MAILJET_API_KEY'
    },
    secretKey: {
      doc: 'Mailjet secret key',
      format: String,
      default: '',
      env: 'MAILJET_SECRET_KEY'
    },
    senderEmail: {
      doc: 'Mailjet sender email',
      format: String,
      default: '',
      env: 'MAILJET_SENDER_EMAIL'
    },
    senderName: {
      doc: 'Mailjet sender name',
      format: String,
      default: '',
      env: 'MAILJET_SENDER_NAME'
    }
  },

  casinoGame: {
    authKey: {
      default: '',
      format: String,
      env: 'CASINO_GAME_AUTH_KEY'
    },
    url: {
      default: '',
      format: String,
      env: 'CASINO_GAME_URL'
    },
    casinoTokenEx: {
      default: '',
      format: String,
      env: 'CASINO_GAME_TOKEN_EX'
    }
  },

  xtremePush: {
    endpoint: {
      doc: 'xtreme push communication endpoint',
      format: String,
      default: '',
      env: 'XTREME_PUSH_ENDPOINT'
    },
    token: {
      doc: 'xtreme push communication access token',
      format: String,
      default: '',
      env: 'XTREME_PUSH_ACCESS_TOKEN'
    }
  },
  veriff: {
    baseUrl: {
      doc: 'Veriff Url',
      format: String,
      default: '',
      env: 'VERIFF_URL'
    },
    secretKey: {
      doc: 'Veriif secret key',
      format: String,
      default: '',
      env: 'VERIFF_SECRET_KEY'
    },
    apiKey: {
      doc: 'veriff api key',
      format: String,
      default: '',
      env: 'VERIFF_API_KEY'
    }
  },
  customerio: {
    siteId: {
      doc: 'site idt',
      format: String,
      default: '',
      env: 'SITE_ID'
    },
    trackApiKey: {
      doc: 'track api key',
      format: String,
      default: '',
      env: 'TRACK_API_KEY'
    },
    appApiKey: {
      doc: 'track api key',
      format: String,
      default: '',
      env: 'APP_API_KEY'
    }
  },
  coinPayment: {
    clientId: {
      doc: 'Coin Payments client Id',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_CLIENT_ID'
    },
    clientSecret: {
      doc: 'coin payments secret key',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_CLIENT_SECRET'
    },
    ipnSecret: {
      doc: 'coin payments ipn secret key',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_IPN_SECRET'
    },
    merchantId: {
      doc: 'coin payments merchant id',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_MERCHANT_ID'
    },
    baseUrl: {
      doc: 'coin payments base url',
      format: String,
      default: '',
      env: 'COIN_PAYMENTS_BASE_URL'
    }
  },
  moonpay: {
    secretKey: {
      doc: 'moonpay secret key',
      format: String,
      default: '',
      env: 'MOONPAY_SECRET_KEY'
    },
    webhookKey: {
      doc: 'moonpay webhook key',
      format: String,
      default: '',
      env: 'MOONPAY_WEBHOOK_KEY'
    }
  },
  veriff: {
    baseUrl: {
      doc: 'Veriff Url',
      format: String,
      default: '',
      env: 'VERIFF_URL'
    },
    secretKey: {
      doc: 'Veriif secret key',
      format: String,
      default: '',
      env: 'VERIFF_SECRET_KEY'
    },
    apiKey: {
      doc: 'veriff api key',
      format: String,
      default: '',
      env: 'VERIFF_API_KEY'
    }
  },
  privy: {
    privyAppId: {
      doc: 'Privy-app-id',
      format: String,
      default: '',
      env: 'PRIVY_APP_ID'
    },
    privyAppSecret: {
      doc: 'Privy secret key',
      format: String,
      default: '',
      env: 'PRIVY_APP_SECRET'
    },
  },
  maxmind: {
    geoliteUrl: {
      doc: 'MaxMind GeoLite URL',
      format: String,
      default: '',
      env: 'MAXMIND_URL_GEOLITE'
    },
    minfraudUrl: {
      doc: 'MaxMind MinFraud URL',
      format: String,
      default: '',
      env: 'MAXMIND_URL_MINFRAUD'
    },
    accountId: {
      doc: 'MaxMind account id',
      format: String,
      default: '',
      env: 'MAXMIND_ACCOUNT_ID'
    },
    licenseKey: {
      doc: 'MaxMind license key',
      format: String,
      default: '',
      env: 'MAXMIND_LICENSE_KEY'
    },
    whitelistedIps: {
      doc: 'MaxMind whitelisted ips',
      format: String,
      default: '',
      env: 'MAXMIND_WHITELISTED_IPS'
    }
  },
  myAffiliates: {
    authUsername: {
      doc: 'MyAffiliates API authorization username',
      format: String,
      default: '',
      env: 'MY_AFFILIATES_AUTH_USERNAME_API'
    },
    authPassword: {
      doc: 'MyAffiliates API authorization password',
      format: String,
      default: '',
      env: 'MY_AFFILIATES_AUTH_PASSWORD_API'
    },
    endpoint: {
      doc: 'MyAffiliates API base endpoint',
      format: String,
      default: '',
      env: 'MY_AFFILIATES_ENDPOINT_API'
    },
  },
  slack: {
    token: {
      doc: 'Slack token',
      format: String,
      default: '',
      env: 'SLACK_TOKEN'
    },
    channelId: {
      doc: 'Slack channel id',
      format: String,
      default: '',
      env: 'SLACK_CHANNEL_ID'
    },
    paymentChannelId: {
      doc: "Payment channel id",
      format: String,
      default: "",
      env: "SLACK_PAYMENT_CHANNEL_ID",
    },
  },
  ipApi: {
    apiKey: {
      doc: 'ip-api service API Key',
      format: String,
      default: '',
      env: 'IPAPI_API_KEY'
    }
  },
  alchemy: {
    everyTokenRPCUrl: {
      doc: 'every token rpc url',
      format: String,
      default: '',
      env: 'EVERY_TOKEN_RPC_URL'
    },
    everyETHAddress: {
      doc: 'every token etherium address',
      format: String,
      default: '',
      env: 'EVERY_ETH_ADDRESS'
    },
    everyTokenBaseUrl: {
      doc: 'every token base url',
      format: String,
      default: '',
      env: 'EVERY_TOKEN_BASE_URL'
    },
    everyBaseAddress: {
      doc: 'every token base address',
      format: String,
      default: '',
      env: 'EVERY_BASE_ADDRESS'
    },
    cacheExpiresIn: {
      doc: 'duration of cache expires in minute',
      format: String,
      default: '',
      env: 'CACHE_EXPIRES_IN'
    }
  },
})

config.validate({ allowed: 'strict' })

export { config }
