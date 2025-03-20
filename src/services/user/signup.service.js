import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { insertUpdate, sendMail } from '@src/libs/customerio/customerio'
import ServiceBase from '@src/libs/serviceBase'
import { GetIpLocationService } from '@src/services/common/getIpLocation.service'
import { CreateWalletService } from '@src/services/user/createWallet.service'
import { CUSTOMER_IO_TRANSACTION_ID } from '@src/utils/constants/app.constants'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    email: { type: 'string' },
    username: { type: 'string' },
    password: { type: 'string' },
    ipAddress: { type: 'string' }
  },
  required: ['email', 'username', 'password', 'ipAddress']
})

export class SignupService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const transaction = this.context.sequelizeTransaction
    const userModel = this.context.sequelize.models.user
    const ipAddress = this.args.ipAddress

    try {
      const { result: country } = await GetIpLocationService.execute(
        { ipAddress },
        this.context
      )
      const user = await userModel.findOne(
        {
          where: {
            [Op.or]: [
              { email: this.args.email },
              { username: this.args.username }
            ]
          }
        },
        { transaction }
      )
      if (user) return this.addError('UsernameOrEmailAlreadyExistsErrorType')

      const encryptedPassword = await bcrypt.hash(
        this.args.password,
        appConfig.bcrypt.salt
      )
      const userData = {
        countryId: country.id,
        email: this.args.email,
        lastLoggedInIp: ipAddress,
        password: encryptedPassword,
        username: this.args.username,
        emailVerified: false
        // phone: this.args.phone || null,
        // gender: this.args.gender || null,
        // lastName: this.args.lastName || null,
        // firstName: this.args.firstName || null,
        // phoneCode: this.args.phoneCode || null,
        // dateOfBirth: this.args.dateOfBirth || null
      }

      const newUser = await userModel.create(userData, { transaction })
      const currencies = await this.context.sequelize.models.currency.findAll({
        raw: true,
        transaction
      })
      newUser.limits = await this.context.sequelize.models.userLimit.createAll(
        newUser.id,
        { transaction }
      )

      newUser.wallets = await Promise.all(
        currencies.map(async (currency) => {
          if (currency.type === 'crypto') {
            const wallet = await CreateWalletService.execute(
              {
                userId: newUser.id,
                currencyId: currency.id,
                isDefault: currency.isDefault
              },
              this.context
            )
            return wallet
          }
        })
      )

      const now = new Date()
      const customerioData = {
        email: newUser.email,
        first_name: '',
        last_name: '',
        timestamp: now.getTime(),
        user_id: newUser.uniqueId
      }
      await insertUpdate(newUser.id, customerioData)

      await user.save({ transaction })

      const payload = {
        userName: newUser.username,
        email: newUser.email,
        customerIoTransactionId: CUSTOMER_IO_TRANSACTION_ID.WELCOME_EMAIL_ID,
        userId: newUser.id
      }
      const mailSent = await sendMail(payload)

      // let phoneVerificationSent = false
      // if (userData.phone) {
      //   const phoneVerificationToken = jwt.sign({ userId: newUser.id, type: JWT_TOKEN_TYPES.PHONE }, appConfig.jwt.secret, { expiresIn: appConfig.jwt.expiry })
      //   phoneVerificationSent = await sendPhoneVerificationSms(phoneVerificationToken)
      // }

      return {
        user: newUser.dataValues,
        emailVerificationSent: !!mailSent?.delivery_id
      }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
