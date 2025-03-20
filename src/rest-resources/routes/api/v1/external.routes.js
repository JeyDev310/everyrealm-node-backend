import { ExternalController } from '@src/rest-resources/controllers/external.controller';
import { responseValidationMiddleware } from '@src/rest-resources/middlewares/responseValidation.middleware';
import { isAuthenticated } from '@src/rest-resources/middlewares/isAuthenticated';
import express from 'express';

const externalRouter = express.Router({ mergeParams: true });

// POST REQUESTS
// General
externalRouter.post('/telegram/save-chat-id', isAuthenticated, ExternalController.telegramSaveChatId, responseValidationMiddleware({}));
externalRouter.post('/telegram/recordButtonClicked', ExternalController.recordButtonClicked, responseValidationMiddleware({}))
// Telegram Bot
externalRouter.post('/telegram/telegram-bot/start', ExternalController.telegramBotStart, responseValidationMiddleware({}));

export { externalRouter };
