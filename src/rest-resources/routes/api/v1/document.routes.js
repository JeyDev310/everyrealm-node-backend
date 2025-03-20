import { DocumentController } from '@src/rest-resources/controllers/document.controller'
import { databaseTransactionHandlerMiddleware } from '@src/rest-resources/middlewares/databaseTransactionHandler.middleware'
import { isAuthenticated } from '@src/rest-resources/middlewares/isAuthenticated'
import { fileUpload } from '@src/rest-resources/middlewares/multer'
import { responseValidationMiddleware } from '@src/rest-resources/middlewares/responseValidation.middleware'
import { fileUploadSchema, successSchema } from '@src/schema/common'
import { getDocumentLabelsSchema, getDocumentsSchema } from '@src/schema/document'
import express from 'express'

const documentRouter = express.Router({ mergeParams: true })

// GET REQUESTS
documentRouter.get('/get-document-labels', DocumentController.getDocumentLabels, responseValidationMiddleware(getDocumentLabelsSchema))
documentRouter.get('/get-documents', isAuthenticated, DocumentController.getDocuments, responseValidationMiddleware(getDocumentsSchema))

// POST REQUESTS
documentRouter.post('/remove', isAuthenticated, DocumentController.removeDocument, responseValidationMiddleware(successSchema))
documentRouter.post('/upload', isAuthenticated, fileUpload(['pdf', 'png', 'jpeg']).single('file'), databaseTransactionHandlerMiddleware, DocumentController.uploadDocument, responseValidationMiddleware(fileUploadSchema))

export { documentRouter }
