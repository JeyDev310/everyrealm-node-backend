import { CasinoGameController } from '@src/rest-resources/controllers/casinoGame.controller';
import { isCasinoAuthenticated } from '@src/rest-resources/middlewares/casino/isCasinoAuthenticated';
import { casinoDatabaseTransactionHandlerMiddleware } from '@src/rest-resources/middlewares/casino/casinoDatabaseTransactionHandler.middleware';
import express from 'express';
import { isAuthenticated } from '@src/rest-resources/middlewares/casino/isAuthenticatedSoftSwiss.middleware';

const casinoSoftSwissRouter = express.Router();

// GET REQUESTS
casinoSoftSwissRouter.post('/play', isAuthenticated, casinoDatabaseTransactionHandlerMiddleware, CasinoGameController.play);
casinoSoftSwissRouter.post('/freespins', isAuthenticated, casinoDatabaseTransactionHandlerMiddleware, CasinoGameController.freespin);
casinoSoftSwissRouter.post('/rollback', isAuthenticated, casinoDatabaseTransactionHandlerMiddleware, CasinoGameController.rollback);

casinoSoftSwissRouter.get('/getUserToken', CasinoGameController.getUserToken);
casinoSoftSwissRouter.get('/getBalance', isCasinoAuthenticated, CasinoGameController.getBalance);
casinoSoftSwissRouter.get('/playerDetails', isCasinoAuthenticated, CasinoGameController.playerDetails);
casinoSoftSwissRouter.get('/betFunds', isCasinoAuthenticated, casinoDatabaseTransactionHandlerMiddleware, CasinoGameController.moveFunds);

// POST REQUESTS
casinoSoftSwissRouter.post('/moveFunds', isCasinoAuthenticated, casinoDatabaseTransactionHandlerMiddleware, CasinoGameController.moveFunds);

export { casinoSoftSwissRouter };
