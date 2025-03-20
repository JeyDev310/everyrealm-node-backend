import { OriginalGameController } from '@src/rest-resources/controllers/originalGame.controller'
import { isAuthenticated } from '@src/rest-resources/middlewares/original/isAuthenticatedOriginals.middleware'
import { casinoDatabaseTransactionHandlerMiddleware } from '@src/rest-resources/middlewares/casino/casinoDatabaseTransactionHandler.middleware'
import express from 'express'

const originalsRouter = express.Router()

// GET REQUESTS
originalsRouter.post('/play', casinoDatabaseTransactionHandlerMiddleware, OriginalGameController.play)

originalsRouter.get('/getBalance', isAuthenticated, OriginalGameController.getBalance)

export { originalsRouter }
