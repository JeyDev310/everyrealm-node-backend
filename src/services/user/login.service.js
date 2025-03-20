import { myAffiliatesConfig } from '@src/configs';
import { APIError } from '@src/errors/api.error';
import ajv from '@src/libs/ajv';
import { Cache, CacheStore } from '@src/libs/cache';
import { insertUpdate, sendMail } from '@src/libs/customerio/customerio';
import { privy } from '@src/libs/privyClient';
import ServiceBase from '@src/libs/serviceBase';
import { CreateWalletService } from '@src/services/user/createWallet.service';
import { generateUsername, getEmailFromPrivy } from '@src/utils';
import { dynamoCreate } from '@src/utils/aws.utils';
import { CACHE_KEYS, CUSTOMER_IO_TRANSACTION_ID } from "@src/utils/constants/app.constants";
import { errorTypes } from '@src/utils/constants/error.constants';
import { logger } from "@src/utils/logger";
import axios from 'axios';
import convert from 'xml-js';
import { GetIpLocationService } from '../common/getIpLocation.service';
import { CheckAndUpdateAllLimits } from '../responsibleGambling/checkAndUpdateAllLimits.service';

const constraints = ajv.compile({
  type: 'object',
  properties: {
    privyId: { type: 'string' },
    ipAddress: { type: 'string' },
    affiliateToken: { type: 'string' }
  },
  required: ['privyId', 'ipAddress']
});

export class LoginService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { affiliateToken, ipAddress, privyId } = this.args;
    logger.info('Start(LoginService):', { affiliateToken, ipAddress, privyId });
    const { address: addressModel, currency: currencyModel, user: userModel } = this.context.sequelize.models;
    const { userLimit: userLimitModel, wallet: walletModel } = this.context.sequelize.models;
    const transaction = this.context.sequelizeTransaction;

    try {
      let privyUser = null;
      try {
        privyUser = await privy.getUser(privyId);
      } catch (error) {
        logger.error('UserNotFound(LoginService):', error);
        return this.addError('UserDoesNotExistsErrorType');
      }

      let user = await userModel.findOne({
        where: { privyId: privyId.startsWith('did:privy:') ? privyId.slice(10) : privyId },
        include: [{
          model: walletModel,
          separate: true,
          include: {
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            model: currencyModel,
            where: { isActive: true },
            required: true
          }
        }, {
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          model: addressModel
        }],
        transaction
      });

      if (user?.isActive === false) {
        logger.error('UserInactive(LoginService)');
        return this.addError('UserInactiveErrorType');
      }

      if (!user) {
        // const { result: country } = await GetIpLocationService.execute({ ipAddress }, this.context);
        const userData = {
          // countryId: country.id,
          countryId: 154,
          emailVerified: false,
          lastLoggedInIp: ipAddress,
          privyId: privyUser?.id,
        };
        const privyEmail = getEmailFromPrivy(privyUser);
        // Code to generate unique usernames or use discord
        let username;
        if (privyUser?.discord && privyUser?.discord?.username) {
          username = privyUser.discord.username;
        } else {
          username = generateUsername();
        }

        // Ensure username uniqueness
        let isUsernameUnique = false;
        while (!isUsernameUnique) {
          const usernameExists = await userModel.findOne({ where: { username }, transaction });
          if (usernameExists) {
            username = generateUsername();
          } else {
            isUsernameUnique = true;
          }
        }
        userData.username = username;

        if (privyEmail) {
          userData.email = privyEmail;
          userData.emailVerified = true;
        }

        user = await userModel.create(userData, { transaction });
        const currencies = await currencyModel.findAll({ raw: true, transaction });

        user.limits = await userLimitModel.createAll(user.id, { transaction });
        user.wallets = await Promise.all(currencies.map(async (currency) => {
          const wallet = await CreateWalletService.execute({
            userId: user.id,
            currencyId: currency.id,
            isDefault: currency.isDefault
          }, this.context);
          return wallet;
        }));

        const customerioData = {
          email: user.email,
          first_name: "",
          last_name: "",
          timestamp: new Date().getTime(),
          user_id: user.uniqueId,
          user_created: true
        };
        await insertUpdate(user.id, customerioData);

        await sendMail({
          customerIoTransactionId: CUSTOMER_IO_TRANSACTION_ID.WELCOME_EMAIL_ID,
          email: user.email,
          userId: user.id,
          userName: user.username,
        });

        if (affiliateToken) {
          const userId = user.id;
          const userCountryRecord = await this.context.sequelize.models.country.findOne({
            where: { id: user.countryId },
            attributes: ['code']
          });
          const userCountryCode = userCountryRecord?.dataValues?.code;

          // Create the DDB item
          const now = new Date();
          const pk = `USER#${userId}`;
          const sk = 'PLAYER';
          const values = [
            { key: 'userId', value: userId },
            { key: 'countryCode', value: userCountryCode || "XX" },
            { key: 'affiliateToken', value: affiliateToken },
            { key: 'joinDate', value: now.valueOf() }
          ];
          await dynamoCreate(pk, sk, values);

          // MyAffiliates API Call - Feed 8: Create Player
          try {
            const MY_AFFILIATES_ENDPOINT_API = myAffiliatesConfig.endpoint;
            const CREATE_PLAYER_FEED_ID = 8;
            const CLIENT_GROUP = 'otherworld';
            const response = await axios.get(
              `${MY_AFFILIATES_ENDPOINT_API}?FEED_ID=${CREATE_PLAYER_FEED_ID}&CLIENT_REFERENCE=${userId}&CLIENT_GROUP=${CLIENT_GROUP}&JOIN_DATE=${new Date().toISOString().split('T')[0]}&TOKEN=${affiliateToken}&DISPLAY_NAME=${userId}&COUNTRY=${userCountryCode}`,
              {
                auth: {
                  username: myAffiliatesConfig.authUsername,
                  password: myAffiliatesConfig.authPassword
                }
              }
            );
            const data = response.data;
            JSON.parse(convert.xml2json(data, { compact: true, spaces: 4 }));
          } catch (error) {
            return this.addError(errorTypes.PlayerCreationErrorType.name);
          }
        }
      }
      await CheckAndUpdateAllLimits.execute({ userId: user.id }, this.context);

      user.moreDetails = {
        ...user.moreDetails,
        privyUser: privyUser
      };
      user.loggedIn = true;
      user.loggedInAt = new Date();
      user.lastLoggedInIp = ipAddress;
      await user.save({ transaction });

      user = await userModel.findOne({
        where: {
          privyId,
          isActive: true
        },
        include: [{
          model: walletModel,
          separate: true,
          include: {
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            model: currencyModel,
            where: { isActive: true },
            required: true
          }
        }, {
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          model: addressModel
        }],
        transaction
      });

      const userResult = { user };
      logger.info('Return(LoginService):', { userResult });
      return userResult;
    } catch (error) {
      logger.error('UnknownError(LoginService):', { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
