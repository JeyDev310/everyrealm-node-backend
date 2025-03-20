import { decorateResponse } from '@src/helpers/response.helpers'
import { GetDocumentLabelsService } from '@src/services/document/getDocumentLabels.service'
import { GetDocumentsService } from '@src/services/document/getDocuments.service'
import { RemoveDocumentService } from '@src/services/document/removeDocument.service'
import { UploadDocumentService } from '@src/services/document/uploadDocument.service'

export class DocumentController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getDocuments (req, res, next) {
    try {
      const result = await GetDocumentsService.execute({ userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getDocumentLabels (req, res, next) {
    try {
      const result = await GetDocumentLabelsService.execute(req.query, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async uploadDocument (req, res, next) {
    try {
      const result = await UploadDocumentService.execute({ ...req.body, file: req.file, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async removeDocument (req, res, next) {
    try {
      const result = await RemoveDocumentService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }
}
