import { MetaMaskController, UserController, VeriffController } from '@src/rest-resources/controllers/user.controller'
import { databaseTransactionHandlerMiddleware } from '@src/rest-resources/middlewares/databaseTransactionHandler.middleware'
import { isAuthenticated } from '@src/rest-resources/middlewares/isAuthenticated'
import { fileUpload } from '@src/rest-resources/middlewares/multer'
import { requestValidationMiddleware } from '@src/rest-resources/middlewares/requestValidation.middleware'
import { responseValidationMiddleware } from '@src/rest-resources/middlewares/responseValidation.middleware'
import { fileUploadSchema, successSchema } from '@src/schema/common'
import { addAddressSchema, getAddressesSchema, getTransactionsSchema, getUserSchema, getWalletsSchema, removeAddressSchema, updateAddressSchema, userAcknowledgeSchema, userForgotPasswordSchema, userSignupSchema, userUpdateSchema } from '@src/schema/user'
import { customerioUnsubscribeSchema } from '@src/schema/user/customerioUnsubscribe.schema'
import { depositSchema } from '@src/schema/user/deposit.schema'
import { verfiyEmailSchema } from '@src/schema/user/verifyEmail.schema'
import express from 'express'

const userRouter = express.Router({ mergeParams: true })

// GET REQUESTS
userRouter.get('/get-user', isAuthenticated, UserController.getUser, responseValidationMiddleware(getUserSchema))
userRouter.get('/get-wallets', isAuthenticated, UserController.getWallets, responseValidationMiddleware(getWalletsSchema))
userRouter.get('/get-transactions', isAuthenticated, UserController.getTransactions, responseValidationMiddleware(getTransactionsSchema))
userRouter.get('/get-addresses', isAuthenticated, UserController.getAddresses, responseValidationMiddleware(getAddressesSchema))
userRouter.get('/verify-email', requestValidationMiddleware(verfiyEmailSchema), databaseTransactionHandlerMiddleware, UserController.verifyEmail, responseValidationMiddleware(successSchema))
userRouter.get('/customerio-unsubscribe', requestValidationMiddleware(customerioUnsubscribeSchema), databaseTransactionHandlerMiddleware, UserController.customerioUnsubscribe, responseValidationMiddleware(successSchema))
userRouter.get('/recent-games', isAuthenticated, UserController.getRecentGames, responseValidationMiddleware({}))
userRouter.get('/init-veriff-kyc', isAuthenticated, requestValidationMiddleware({}), VeriffController.createSession, responseValidationMiddleware({}))
userRouter.post('/create-transaction', UserController.createTransaction, responseValidationMiddleware({}))
userRouter.post('/bypass-veriff-kyc', isAuthenticated, VeriffController.byPassVeriffKyc, responseValidationMiddleware({}))

// POST REQUESTS
userRouter.post('/signup', requestValidationMiddleware(userSignupSchema), databaseTransactionHandlerMiddleware, UserController.signup, responseValidationMiddleware(userSignupSchema))
userRouter.post('/logout', isAuthenticated, UserController.logout, responseValidationMiddleware(successSchema))
userRouter.post('/update-session-limit', isAuthenticated, UserController.updateSessionLimit, responseValidationMiddleware(successSchema))
userRouter.post('/update', isAuthenticated, databaseTransactionHandlerMiddleware, requestValidationMiddleware(userUpdateSchema), UserController.update, responseValidationMiddleware(userUpdateSchema))
userRouter.post('/update-privy-user', isAuthenticated, databaseTransactionHandlerMiddleware, requestValidationMiddleware({}), UserController.updatePrivyUser, responseValidationMiddleware(userUpdateSchema))
userRouter.post('/user-acknowledge', isAuthenticated, databaseTransactionHandlerMiddleware, requestValidationMiddleware(userAcknowledgeSchema), UserController.userAcknowledge, responseValidationMiddleware(userUpdateSchema))
userRouter.post('/update-address', isAuthenticated, databaseTransactionHandlerMiddleware, requestValidationMiddleware(updateAddressSchema), UserController.updateAddress, responseValidationMiddleware(updateAddressSchema))
userRouter.post('/add-address', isAuthenticated, databaseTransactionHandlerMiddleware, requestValidationMiddleware(addAddressSchema), UserController.addAddress, responseValidationMiddleware(addAddressSchema))
userRouter.post('/remove-address', isAuthenticated, requestValidationMiddleware(removeAddressSchema), UserController.removeAddress, responseValidationMiddleware(successSchema))
userRouter.post('/forgot-password', UserController.forgotPassword, responseValidationMiddleware(userForgotPasswordSchema))
userRouter.post('/deposit', isAuthenticated, requestValidationMiddleware(depositSchema), UserController.deposit, responseValidationMiddleware(depositSchema))
userRouter.post('/upload-profile-image', isAuthenticated, fileUpload(['png', 'jpeg']).single('file'), UserController.uploadProfileImage, responseValidationMiddleware(fileUploadSchema))
userRouter.post('/wallet/set-default', isAuthenticated, UserController.setDefaultWallet, responseValidationMiddleware({}))
userRouter.post('/add-waitlist', UserController.addWaitlist, responseValidationMiddleware({}))
userRouter.post('/add-betawaitlist', UserController.addBetaWaitlist, responseValidationMiddleware({}))

// Metamask Login
userRouter.post('/meta-mask/generate-none', databaseTransactionHandlerMiddleware, MetaMaskController.generateNonce, responseValidationMiddleware({}))
userRouter.post('/meta-mask/verify-signature', databaseTransactionHandlerMiddleware, MetaMaskController.verifySignature, responseValidationMiddleware({}))

userRouter.get('/get-connected-wallets', isAuthenticated, UserController.getConnectedWallets, responseValidationMiddleware({}))
userRouter.post('/set-default-linked-wallet', isAuthenticated, UserController.setDefaultLinkedWallet, responseValidationMiddleware({}))

export { userRouter }
