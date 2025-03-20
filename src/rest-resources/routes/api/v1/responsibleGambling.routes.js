import { ResponsibleGamblingController } from '@src/rest-resources/controllers/responsibleGambling.controller'
import { databaseTransactionHandlerMiddleware } from '@src/rest-resources/middlewares/databaseTransactionHandler.middleware'
import { isAuthenticated } from '@src/rest-resources/middlewares/isAuthenticated'
import { requestValidationMiddleware } from '@src/rest-resources/middlewares/requestValidation.middleware'
import { responseValidationMiddleware } from '@src/rest-resources/middlewares/responseValidation.middleware'
import { successSchema } from '@src/schema/common'
import { getLimitsSchema, updateLimitsSchema, updateSelfExclusionSchema } from '@src/schema/responsibleGambling'
import { resetLimitsSchema } from '@src/schema/responsibleGambling/resetLimit.schema'
import express from 'express'

const responsibleGamblingRouter = express.Router({ mergeParams: true })

// GET REQUESTS
responsibleGamblingRouter.get('/get-limits', isAuthenticated, ResponsibleGamblingController.getLimits, responseValidationMiddleware(getLimitsSchema))

// POST REQUESTS
responsibleGamblingRouter.post('/update-limit', isAuthenticated, requestValidationMiddleware(updateLimitsSchema), databaseTransactionHandlerMiddleware, ResponsibleGamblingController.updateLimit, responseValidationMiddleware(successSchema))
responsibleGamblingRouter.post('/update-self-exclusion', isAuthenticated, requestValidationMiddleware(updateSelfExclusionSchema), databaseTransactionHandlerMiddleware, ResponsibleGamblingController.updateSelfExclusion, responseValidationMiddleware(successSchema))
responsibleGamblingRouter.post('/reset-limit', isAuthenticated, requestValidationMiddleware(resetLimitsSchema), databaseTransactionHandlerMiddleware, ResponsibleGamblingController.resetLimit, responseValidationMiddleware(successSchema))

export { responsibleGamblingRouter }
