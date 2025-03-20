import { CoinPaymentsController } from '@src/rest-resources/controllers/payment.controller'
import { databaseTransactionHandlerMiddleware } from '@src/rest-resources/middlewares/databaseTransactionHandler.middleware'
import { isAuthenticated } from '@src/rest-resources/middlewares/isAuthenticated'
import { validateMoonpaySignature } from '@src/rest-resources/middlewares/payment/validateMoonpaySignature.middleware'
import { maintenanceCheckMiddleware } from '@src/rest-resources/middlewares/maintenanceCheck.middleware'
import { validateCoinPaymentIPNMiddleware } from '@src/rest-resources/middlewares/payment/validateCoinPaymentIPN.middleware'
import { responseValidationMiddleware } from '@src/rest-resources/middlewares/responseValidation.middleware'
import express from 'express'

const paymentRouter = express.Router({ mergeParams: true })

// Get Withdrawable Currencies
paymentRouter.get('/get-withdrawable-currencies', isAuthenticated, CoinPaymentsController.getWithdrawableCurrencies, responseValidationMiddleware({}))

// Coin Payments
paymentRouter.post('/coin-payments/deposit', isAuthenticated, databaseTransactionHandlerMiddleware, CoinPaymentsController.coinPaymentDepositAmount, responseValidationMiddleware({}))
paymentRouter.post('/coin-payments/webhook', validateCoinPaymentIPNMiddleware, databaseTransactionHandlerMiddleware, CoinPaymentsController.coinPaymentWebhhok, responseValidationMiddleware({}))
paymentRouter.post('/coin-payments/withdraw', maintenanceCheckMiddleware, isAuthenticated, databaseTransactionHandlerMiddleware, CoinPaymentsController.coinPaymentWithdrawAmount, responseValidationMiddleware({}))


// MoonPay
paymentRouter.post('/moonpay-payments/webhook', validateMoonpaySignature, databaseTransactionHandlerMiddleware, CoinPaymentsController.moonpayWebhook, responseValidationMiddleware({}))
paymentRouter.post('/moonpay-payments/get-signature', databaseTransactionHandlerMiddleware, CoinPaymentsController.moonpayGetSignature, responseValidationMiddleware({}))


// internal use
paymentRouter.post('/coin-payments/update-webhook', isAuthenticated, CoinPaymentsController.updateWebhookUrl, responseValidationMiddleware({}))
paymentRouter.post('/coin-payments/create-wallet', isAuthenticated, CoinPaymentsController.createCurrencyWallet, responseValidationMiddleware({}))
paymentRouter.get('/coin-payments/get-wallet-address', isAuthenticated, CoinPaymentsController.getWalletAddress, responseValidationMiddleware({}))

export { paymentRouter }
