import { appConfig } from '@src/configs'
import countryCodesToCountries from '@src/database/models/static/countryCodesToCountries.json'
import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import { sendMail } from '@src/libs/customerio/customerio'
import ServiceBase from '@src/libs/serviceBase'
import { CUSTOMER_IO_TRANSACTION_ID } from "@src/utils/constants/app.constants"
import { USER_GENDER } from '@src/utils/constants/public.constants.utils'
import { countryCodeWithoutZipCode, zipCodeRegex } from '@src/utils/zipcodeValidation.utils'
import bcrypt from 'bcrypt'
import { Op } from 'sequelize'
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    address: { type: 'string'},
    attestation: { type: 'boolean' },
    city: { type: 'string' },
    countryCode: { enum: Object.keys(countryCodesToCountries) },
    dateOfBirth: { type: 'string' },
    firstName: { type: 'string' },
    gender: { enum: Object.values(USER_GENDER) },
    lastName: { type: 'string' },
    occupation: { type: 'string' },
    password: { type: 'string' },
    phone: { type: 'string' },
    phoneCode: { type: 'string' },
    userId: { type: 'string' },
    username: { type: 'string' },
    zipCode: { type: 'string' },
  },
  required: ['userId']
})

const checkZipcode = (zipcode, countryCode) => {
  if (countryCodeWithoutZipCode.includes(countryCode))
    return true;

  const zipCodeValidator = new RegExp(zipCodeRegex[countryCode]);
  return zipCodeValidator.test(zipcode);
};

export class UpdateUserService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {
    logger.info('Start(UpdateUserService): ', { args: this.args });
    try {
      const { dateOfBirth, firstName, gender, lastName, occupation, password, userId, username } = this.args;
      const { address, attestation, city, countryCode, zipCode } = this.args;
      const transaction = this.context.sequelizeTransaction
      const userModel = this.context.sequelize.models.user

      const user = await userModel.findOne({ where: { id: userId }, transaction })
      if (!user) {
        logger.info('UserDoesNotExist(UpdateUserService)');
        return this.addError('UserDoesNotExistsErrorType');
      }

      if (password) {
        const encryptedPassword = await bcrypt.hash(password, appConfig.bcrypt.salt)
        user.password = encryptedPassword
      }

      if (countryCode) {
        const countryId = await this.context.sequelize.models.country.findOne({ where: { code: countryCode },  attributes: ['id'] })
        user.countryId = countryId.id ?? user.countryId
      }

      user.dateOfBirth = dateOfBirth ?? user.dateOfBirth
      user.firstName = firstName ?? user.firstName
      user.gender = gender ?? user.gender
      user.lastName = lastName ?? user.lastName
      user.occupation = occupation ?? user.occupation
      user.publicAddress = address ?? user.publicAddress

      if (username) {
        const usernameExists = await userModel.findOne({ where: { username, id: { [Op.ne]: user.id } }, transaction })
        if (usernameExists) {
          logger.info('UsernameAlreadyUsed(UpdateUserService)');
          return this.addError('UsernameIsTakenErrorType');
        }

        user.username = username
      }

      let userAddress = await this.context.sequelize.models.address.findOne({
        where: { userId: userId },
        transaction
      })

      if (countryCode && city && checkZipcode(zipCode, countryCode)) {
        if(!userAddress) {
          userAddress = await this.context.sequelize.models.address.create(
            { address, countryCode, city, zipCode, userId },
            { transaction }
          )
        } else {
          if (countryCode)
            userAddress.countryCode = countryCode
          if (city)
            userAddress.city = city
          if (zipCode)
            userAddress.zipCode = zipCode
          if (address)
            userAddress.address = address
          await userAddress.save({ transaction })
        }
      }

      const isAddressValid = userAddress?.countryCode && userAddress?.city && checkZipcode(userAddress?.zipCode, userAddress?.countryCode);
      if (user?.firstName && user?.lastName && user?.dateOfBirth && user?.occupation && isAddressValid) {
        user.moreDetails = {
          ...user.moreDetails,
          attestation: attestation === true,
          personalDetails: true,
        }
        const payload = {
          customerIoTransactionId :CUSTOMER_IO_TRANSACTION_ID.KYC_L1_VERIFICATION_ID,
          email : user.email,
          userId: user.id,
          userName : user.username,
        }
        await sendMail(payload)
      }

      await user.save({ transaction })
      logger.info('Return(UpdateUserService): ', { user });
      return { user }
    } catch (error) {
      logger.error('UnkownError(UpdateUserService): ',  { message: error.message, stack: error.stack });
      throw new APIError(error)
    }
  }
}
