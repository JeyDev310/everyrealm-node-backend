import { CasinoController } from '@src/rest-resources/controllers/casino.controller'
import { isAuthenticated } from '@src/rest-resources/middlewares/isAuthenticated'
import { isSemiAuthenticated } from '@src/rest-resources/middlewares/isSemiAuthenticated'
import { responseValidationMiddleware } from '@src/rest-resources/middlewares/responseValidation.middleware'
import express from 'express'

const casinoRouter = express.Router({ mergeParams: true })

// GET REQUESTS
casinoRouter.get('/get-all-games', isSemiAuthenticated, CasinoController.getAllGames, responseValidationMiddleware({}))
casinoRouter.get('/get-game', CasinoController.getGame, responseValidationMiddleware({}))
casinoRouter.get('/get-providers', CasinoController.getGameProvider, responseValidationMiddleware({}))
casinoRouter.get('/get-categories', CasinoController.getGameCategory, responseValidationMiddleware({}))
casinoRouter.get('/get-favorite-games', isAuthenticated, CasinoController.getFavoriteGame, responseValidationMiddleware({}))
casinoRouter.get('/get-transactions', isAuthenticated, CasinoController.getCasinoTransactions, responseValidationMiddleware({}))
casinoRouter.get('/get-history', isSemiAuthenticated, CasinoController.getCasinoHistory, responseValidationMiddleware({}))

// POST REQUESTS
casinoRouter.post('/toggle-favorite-game', isAuthenticated, CasinoController.toggleFavoriteGame, responseValidationMiddleware({}))
casinoRouter.post('/init-game', isAuthenticated, CasinoController.initGame, responseValidationMiddleware({}))
casinoRouter.post('/init-game-demo', CasinoController.initGameDemo, responseValidationMiddleware({}))

export { casinoRouter }
