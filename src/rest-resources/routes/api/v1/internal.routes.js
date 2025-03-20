import { InternalController } from '@src/rest-resources/controllers/internal.controller';
import { isBasicAuthenticatedMiddleware } from '@src/rest-resources/middlewares/isBasicAuthenticated.middleware';
import { responseValidationMiddleware } from '@src/rest-resources/middlewares/responseValidation.middleware';
import express from 'express';

const internalRouter = express.Router({ mergeParams: true });

// POST REQUESTS
internalRouter.post('/update-password', isBasicAuthenticatedMiddleware, InternalController.updatePassword, responseValidationMiddleware({}));
internalRouter.post('/send-reset-password-email', isBasicAuthenticatedMiddleware, InternalController.sendResetPasswordEmail, responseValidationMiddleware({}));

export { internalRouter };
