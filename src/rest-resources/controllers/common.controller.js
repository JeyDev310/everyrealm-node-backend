import { decorateResponse } from '@src/helpers/response.helpers'
import { GetBannersService } from '@src/services/common/getBanners.service'
import { GetCountriesService } from '@src/services/common/getCountries.service'
import { GetCurrenciesService } from '@src/services/common/getCurrencies.service'
import { GetLanguagesService } from '@src/services/common/getLanguages.service'
import { GetPagesService } from '@src/services/common/getPages.service'
import { GetSettingsService } from '@src/services/common/getSettings.service'
import { getIp } from '@src/utils'
import { GetGeoLocationService } from '@src/services/common/getGeoLocation.service'

export class CommonController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async getSettings (req, res, next) {
    try {
      const result = await GetSettingsService.execute({}, req.context)
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
  static async getLanguages (req, res, next) {
    try {
      const result = await GetLanguagesService.execute({}, req.context)
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
  static async getPages (req, res, next) {
    try {
      const result = await GetPagesService.execute({}, req.context)
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
  static async getCurrencies (req, res, next) {
    try {
      const result = await GetCurrenciesService.execute({}, req.context)
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
  static async getBanners (req, res, next) {
    try {
      const result = await GetBannersService.execute({}, req.context)
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
  static async getCountries (req, res, next) {
    try {
      const result = await GetCountriesService.execute({}, req.context)
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
  static async verifyIp (req, res, next) {
    try {
      const result = await GetGeoLocationService.execute({ ipAddress: getIp(req) }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

}
