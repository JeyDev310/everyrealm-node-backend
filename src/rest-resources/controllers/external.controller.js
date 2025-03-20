import { decorateResponse } from '@src/helpers/response.helpers';
import { TelegramBotStartService } from '@src/services/external/telegramBotStart.service';
import { TelegramSaveChatIdService } from '@src/services/external/telegramSaveChatId.service';
import { RecordButtonClickedService } from '@src/services/external/recordButtonClicked.service';

export class ExternalController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async telegramBotStart (req, res, next) {
    try {
      const result = await TelegramBotStartService.execute({message: req.body?.message, method: req.method}, req.context)
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
  static async telegramSaveChatId (req, res, next) {
    try {
      const result = await TelegramSaveChatIdService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
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
  static async recordButtonClicked (req, res, next) {
    try {
      const result = await RecordButtonClickedService.execute({ ...req.body }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }
}
