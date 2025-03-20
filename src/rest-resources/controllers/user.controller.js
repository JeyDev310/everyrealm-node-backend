import { decorateResponse } from '@src/helpers/response.helpers'
import { createSession } from '@src/helpers/session.helper'
import { veriffResponseDecorator } from '@src/helpers/veriff.response.helpers'
import { CreateCasinoTransactionService } from '@src/services/casino/common/createCasinoTransaction.service'
import { GenerateNonceService } from '@src/services/metaMask/generateNonce.service'
import { SignupWithAdressService } from '@src/services/metaMask/signupWithAddress.service'
import { VerifySignatureService } from '@src/services/metaMask/verifySignature.service'
import { GetTransactionService } from '@src/services/transaction/getTransactions.service'
import { AddAddressService } from '@src/services/user/addAddress.service'
import { AddBetaWaitlistService } from '@src/services/user/addBetaWaitlist'
import { AddWaitlistService } from '@src/services/user/addWaitlist'
import { ForgotPasswordService } from '@src/services/user/forgotPassword.service'
import { GetAddressesService } from '@src/services/user/getAddresses.service'
import { GetUserService } from '@src/services/user/getUser.service'
import { GetWalletsService } from '@src/services/user/getWallets.service'
import { LoginService } from '@src/services/user/login.service'
import { LogoutService } from '@src/services/user/logout.service'
import { RemoveAddressService } from '@src/services/user/removeAddress.service'
import { SetDefaultWalletService } from '@src/services/user/setDefaultWallet.service'
import { SignupService } from '@src/services/user/signup.service'
import { UnsubscribeCustomerIoEmailService } from '@src/services/user/unsubscribeCustomerIoemail.service'
import { UpdateAddressService } from '@src/services/user/updateAddress.service'
import { UpdatePrivyUserService } from '@src/services/user/updatePrivyUser.service'
import { UpdateSessionLimitService } from '@src/services/user/updateSessionLimit.service'
import { UpdateUserService } from '@src/services/user/updateUser.service'
import { UploadProfileImageService } from '@src/services/user/uploadProfileImage.service'
import { UserAcknowledgeService } from '@src/services/user/userAcknowledge.service'
import { DepositService } from '@src/services/user/userDeposite.service'
import { VerifyEmailService } from '@src/services/user/verifyEmail.service'
import { ByPassVeriffKycService } from '@src/services/veriff/byPassVeriffKyc.service'
import { UpdateKycStatusService } from '@src/services/veriff/callbacks/updateKycStatus.service'
import { CreateVeriffSessionService } from '@src/services/veriff/createVeriffSession.service'
import { GetConnectedWallets } from '@src/services/user/getConnectedWallets.service'
import { SetDefaultLinkedWalletService } from '@src/services/user/setDefaultLinkedWallet.service'
import { getIp } from '@src/utils'
import { logger } from '@src/utils/logger'

export class UserController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async signup(req, res, next) {
    try {
      const result = await SignupService.execute({ ...req.body, ipAddress: getIp(req) }, req.context)
      if (result.success) result.result.accessToken = await createSession(req, result.result.user.uniqueId, result.result.user.sessionLimit)
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
  static async login(req, res, next) {
    try {
      const result = await LoginService.execute({ ...req.body, ipAddress: getIp(req) }, req.context)
      // if (result.success) result.result.accessToken = await createSession(req, result.result.user.uniqueId, result.result.user.sessionLimit)
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
  static async logout(req, res, next) {
    try {
      const result = await LogoutService.execute({ privyId: req.authenticated.userPrivyId, userId: req.authenticated.userId }, req.context)
      // destroySession(req)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  static async createTransaction(req, res, next) {
    try {
      const result = await CreateCasinoTransactionService.execute({ ...req.body }, req.context)
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
  static async update(req, res, next) {
    try {
      const result = await UpdateUserService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
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
  static async updatePrivyUser(req, res, next) {
    try {
      const result = await UpdatePrivyUserService.execute({ ...req.body, userId: req.authenticated.userId, userPrivyId: req.authenticated?.userPrivyId }, req.context)
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
  static async getUser(req, res, next) {
    try {
      const result = await GetUserService.execute({ userId: req.authenticated.userId }, req.context)
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
  static async getWallets(req, res, next) {
    try {
      const result = await GetWalletsService.execute({ userId: req.authenticated.userId }, req.context)
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
  static async getTransactions(req, res, next) {
    try {
      const result = await GetTransactionService.execute({ ...req.query, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  static async getRecentGames(req, res, next) {
    try {
      const result = await GetRecentGamesService.execute({ ...req.query, userId: req.authenticated.userId }, req.context)
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
  static async verifyEmail(req, res, next) {
    try {
      const result = await VerifyEmailService.execute(req.query, req.context)
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
  static async customerioUnsubscribe(req, res, next) {
    try {
      const result = await UnsubscribeCustomerIoEmailService.execute(req.query, req.context)
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
  static async deposit(req, res, next) {
    try {
      const result = await DepositService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
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
  static async forgotPassword(req, res, next) {
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
  static async updateSessionLimit(req, res, next) {
    try {
      const result = await UpdateSessionLimitService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
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
  static async getAddresses(req, res, next) {
    try {
      const result = await GetAddressesService.execute({ userId: req.authenticated.userId }, req.context)
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
  static async addAddress(req, res, next) {
    try {
      const result = await AddAddressService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
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
  static async removeAddress(req, res, next) {
    try {
      const result = await RemoveAddressService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
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
  static async updateAddress(req, res, next) {
    try {
      const result = await UpdateAddressService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
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
  static async uploadProfileImage(req, res, next) {
    try {
      const result = await UploadProfileImageService.execute({ file: req.file, userId: req.authenticated.userId }, req.context)
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
  static async setDefaultWallet(req, res, next) {
    try {
      const result = await SetDefaultWalletService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  static async addWaitlist(req, res, next) {
    try {
      const result = await AddWaitlistService.execute({ ...req.body }, req.context)
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
  static async addBetaWaitlist(req, res, next) {
    try {
      const result = await AddBetaWaitlistService.execute({ ...req.body }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  static async getConnectedWallets(req, res, next) {
    try {
      const result = await GetConnectedWallets.execute({ ...req.query, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  static async setDefaultLinkedWallet(req, res, next) {
    try {
      const result = await SetDefaultLinkedWalletService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
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
  static async userAcknowledge(req, res, next) {
    try {
      const result = await UserAcknowledgeService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }
}

export class MetaMaskController {
  /**
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  static async generateNonce(req, res, next) {
    try {
      const result = await GenerateNonceService.execute({ ...req.body }, req.context)
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
  static async verifySignature(req, res, next) {
    try {
      const result = await VerifySignatureService.execute({ ...req.body, ipAddress: getIp(req) }, req.context)
      if (result.success) result.result.accessToken = await createSession(req, result.result.user.id, result.result.user.sessionLimit)
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
  static async signUpMetaMask(req, res, next) {
    try {
      const result = await SignupWithAdressService.execute({ ...req.body, ipAddress: getIp(req) }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }
}

export class VeriffController {
  /**
  * @param {import('express').Request} req
  * @param {import('express').Response} res
  * @param {import('express').NextFunction} next
  */
  static async createSession(req, res, next) {
    try {
      const result = await CreateVeriffSessionService.execute({ ...req.query, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  static async byPassVeriffKyc(req, res, next) {
    try {
      const result = await ByPassVeriffKycService.execute({ ...req.body, userId: req.authenticated.userId }, req.context)
      decorateResponse({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }

  static async callback(req, res, next) {
    try {
      const result = await UpdateKycStatusService.execute({ ...req.body, ...req.query }, req.context)
      veriffResponseDecorator({ req, res, next }, result)
    } catch (error) {
      next(error)
    }
  }
}
