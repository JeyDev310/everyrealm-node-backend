import { CommonController } from '@src/rest-resources/controllers/common.controller'
import { responseValidationMiddleware } from '@src/rest-resources/middlewares/responseValidation.middleware'
import { getCurrenciesSchema, getLanguagesSchema, getPagesSchema, getSettingsSchema } from '@src/schema/common'
import express from 'express'

const commonRouter = express.Router({ mergeParams: true })

// GET REQUESTS
commonRouter.get('/get-pages', CommonController.getPages, responseValidationMiddleware(getPagesSchema))
commonRouter.get('/get-settings', CommonController.getSettings, responseValidationMiddleware(getSettingsSchema))
commonRouter.get('/get-banners', CommonController.getBanners, responseValidationMiddleware({}))
commonRouter.get('/get-languages', CommonController.getLanguages, responseValidationMiddleware(getLanguagesSchema))
commonRouter.get('/get-countries', CommonController.getCountries, responseValidationMiddleware({}))
commonRouter.get('/get-currencies', CommonController.getCurrencies, responseValidationMiddleware(getCurrenciesSchema))
commonRouter.get('/verify-ip', CommonController.verifyIp, responseValidationMiddleware({}))

export { commonRouter }
