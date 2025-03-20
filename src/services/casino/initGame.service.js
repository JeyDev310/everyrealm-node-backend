import { appConfig } from "@src/configs";
import { casinoSoftSwissAggregatorConfig } from "@src/configs/casinoSoftSwissAggregator.config";
import { originalConfig } from "@src/configs/original.config";
import { APIError } from "@src/errors/api.error";
import ServiceBase from "@src/libs/serviceBase";
import { ADDITIONAL_VERIFICATION_LEVELS } from "@src/utils/constants/app.constants";
import axios from "axios";
import CryptoJS from "crypto-js";
import encode from "crypto-js/enc-hex";
import ajv from "src/libs/ajv";
import { GetIpLocationService } from "src/services/common/getIpLocation.service";
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: "object",
  properties: {
    gameId: { type: "string" },
    ipAddress: { type: 'string' },
    isDemo: { type: "boolean", default: true },
    userId: { type: "string" },
  },
  required: ["gameId", "isDemo"],
});

export class InitGameService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { gameId, ipAddress, isDemo, userId } = this.args;
    logger.info('Start(InitGameService): ', { gameId, ipAddress, isDemo, userId });
    const AUTH_TOKEN = `${casinoSoftSwissAggregatorConfig.accessToken}`;
    const transaction = this.context.sequelizeTransaction;
    const { address: addressModel, casinoGame: casinoGameModel, currency: currencyModel, user: userModel, wallet: walletModel } = this.context.sequelize.models;

    try {
      const { result: country } = await GetIpLocationService.execute({ ipAddress: ipAddress }, this.context);
      const userDetails = await userModel.findOne({
        where: { id: userId },
        attributes: ["uniqueId", "email", "username", "firstName", "lastName", "dateOfBirth", "createdAt", "gender", "moreDetails"],
        include: {
          attributes: ["id", "userId", "amount", "withdrawableAmount"],
          model: walletModel,
          where: { isDefault: true },
          include: {
            attributes: ["id", "code"],
            where: { isActive: true },
            model: currencyModel,
            required: true,
          },
          required: true,
          separate: true,
        },
      });

      const additionalVerification = userDetails.moreDetails?.additionalVerification;
      if (additionalVerification == ADDITIONAL_VERIFICATION_LEVELS.LEVEL2_REQUIRED) {
        logger.error('Level2VerificationRequired(InitGameService)');
        return this.addError('Level2RequiredErrorType');
      } else if (additionalVerification == ADDITIONAL_VERIFICATION_LEVELS.LEVEL3_REQUIRED) {
        logger.error('Level3VerificationRequired(InitGameService)');
        return this.addError('Level3RequiredErrorType');
      }

      const address = await addressModel.findOne({
        where: { userId },
        attributes: ["city"],
        order: [["createdAt", "DESC"]],
        transaction,
      });
      const gameDetail = await casinoGameModel.findOne({
        where: {
          uniqueId: gameId,
          isActive: true
        },
        attributes: ['identifier', 'name', 'casino_provider_id']
      });
      if (!gameDetail) {
        logger.error('GameNotFound(InitGameService)');
        return this.addError('GameInactiveErrorType');
      }

      const parameters = {
        casino_id: `${casinoSoftSwissAggregatorConfig.casinoId}`,
        client_type: "desktop",
        currency: "EUR",
        game: `${gameDetail?.identifier}`,
        ip: `${ipAddress}`,
        locale: "en",
        urls: {
          deposit_url: `${appConfig?.app?.userFeUrl}?wallet=open&tab=deposit`,
          return_url: `${appConfig?.app?.userFeUrl}`,
        },
        user: {
          city: `${address?.city || "test"}`,
          country: `${country?.code || 'US'}`,
          date_of_birth: userDetails?.dateOfBirth ? new Date(userDetails.dateOfBirth).toISOString().split("T")[0] : "2000-01-01",
          email: `${userDetails.email}`,
          firstname: `${userDetails?.firstName || "test"}`,
          gender: "m",
          id: `${userDetails.uniqueId}_${userDetails.wallets[0].currency.code}`,
          lastname: `${userDetails?.lastName || "test"}`,
          nickname: `${userDetails.username}`,
          registered_at: userDetails?.createdAt ? new Date(userDetails.createdAt).toISOString().split("T")[0] : "2000-01-01",
        },
      };
      let token = CryptoJS.HmacSHA256(JSON.stringify(parameters), AUTH_TOKEN).toString(encode);

      let endpointUrl = casinoSoftSwissAggregatorConfig.gcpUrl;
      /* move these to an enum for all games  and import it */
      if (gameId == process.env.CRASH_GAME_ID) {
        endpointUrl = originalConfig.crashURL;
        parameters.wallets = userDetails.wallets;
        token = CryptoJS.HmacSHA256(JSON.stringify(parameters), originalConfig.accessToken).toString(encode);
      } else if (gameId == "a66ba64e-63cd-40af-8f71-939547d062ac") {
        endpointUrl = originalConfig.plinkoUrl;
        parameters.wallets = userDetails.wallets;
        token = CryptoJS.HmacSHA256(JSON.stringify(parameters), originalConfig.accessToken).toString(encode);
      }
      else if (gameId == process.env.BLSH_GAME_ID) {
        endpointUrl = originalConfig.blshUrl;
        parameters.wallets = userDetails.wallets;
        token = CryptoJS.HmacSHA256(JSON.stringify(parameters), originalConfig.accessToken).toString(encode);
      }

      let finalUrl = `${endpointUrl}/sessions`;
      if (isDemo)
        finalUrl = `${endpointUrl}/demo`;
      const gameResponse = await axios.post(finalUrl, parameters, { headers: { "X-REQUEST-SIGN": token } });
      const result = {
        launchGameUrl: gameResponse?.data,
        gameName: gameDetail?.name,
      };
      logger.info('Return(InitGameService): ', { result });
      return result;
    } catch (error) {
      logger.error('UnknonwError(InitGameService): ', { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
