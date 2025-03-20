import { appConfig } from '@src/configs'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { GetIpLocationService } from '@src/services/common/getIpLocation.service'
import { CreateWalletService } from '@src/services/user/createWallet.service'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import { generateUsername } from 'unique-username-generator'
import { XtremePushAxios } from '@src/libs/axios/xtremePush.axios'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    publicAddress: { type: 'string' },
    nonce: { type: 'string' }
  },
  required: ['publicAddress', 'nonce']
})

export class SignupWithAdressService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    const transaction = this.context.sequelizeTransaction
    const userModel = this.context.sequelize.models.user
    const ipAddress = this.args.ipAddress
    try {
      const { result: country } = await GetIpLocationService.execute({ ipAddress }, this.context)
      const user = await userModel.findOne({ where: { publicAddress: this.args.publicAddress } }, { transaction })
      if (user) return this.addError('AddressAlreadyExistsErrorType')

      if (this.args.email || this.args.username) {
        const userExists = await userModel.findOne({ where: { [Op.or]: [{ email: this.args.email }, { username: this.args.username }] } }, { transaction })
        if (userExists) return this.addError('UsernameOrEmailAlreadyExistsErrorType')
      }

      const userData = {
        kycStatus: false,
        countryId: country.id,
        lastLoggedInIp: ipAddress,
        nonce: this.args.nonce,
        publicAddress: this.args.publicAddress,
        email: this.args.email || null,
        username: generateUsername('', 3),
        emailVerified: true,
        password: await bcrypt.hash('Test@123', appConfig.bcrypt.salt)
      }
      // if (this.args.password) {
      //   const encryptedPassword = await bcrypt.hash('Test@123', appConfig.bcrypt.salt)
      //   userData.password = encryptedPassword || null
      // }

      const newUser = await userModel.create(userData, { transaction })
      const currencies = await this.context.sequelize.models.currency.findAll({ raw: true })
      newUser.limits = await this.context.sequelize.models.userLimit.createAll(newUser.id, { transaction })

      newUser.wallets = await Promise.all(currencies.map(async (currency) => {
        const wallet = await CreateWalletService.execute({ userId: newUser.id, currencyId: currency.id, isDefault: currency.isDefault }, this.context)
        return wallet
      }))


      await XtremePushAxios.createXtremepushUserProfile(newUser)
      await XtremePushAxios.sendEmailByXtremepush('120047730', newUser.firstName, newUser.email, newUser.id)
      return { user: newUser }
    } catch (error) {
      throw new APIError(error)
    }
  }
}
