import { decorateResponse } from '@src/helpers/response.helpers';
import { ForgotPasswordService } from '@src/services/user/forgotPassword.service';
import { UpdatePasswordService } from '@src/services/user/updatePassword.service';

export class InternalController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async sendResetPasswordEmail (req, res, next) {
    try {
      const result = await ForgotPasswordService.execute(req.body, req.context)
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
  static async updatePassword (req, res, next) {
    try {
      const result = await UpdatePasswordService.execute(req.body, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }
}
