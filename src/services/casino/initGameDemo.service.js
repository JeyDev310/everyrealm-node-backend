import { appConfig } from "@src/configs";
import { casinoSoftSwissAggregatorConfig } from "@src/configs/casinoSoftSwissAggregator.config";
import { originalConfig } from "@src/configs/original.config";
import { APIError } from "@src/errors/api.error";
import ServiceBase from "@src/libs/serviceBase";
import axios from "axios";
import CryptoJS from "crypto-js";
import encode from "crypto-js/enc-hex";
import ajv from "src/libs/ajv";
import { logger } from '@src/utils/logger'

const constraints = ajv.compile({
  type: "object",
  properties: {
    gameId: { type: "string" },
    ipAddress: { type: 'string' },
  },
  required: ["gameId"],
});

export class InitGameDemoService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { gameId, ipAddress } = this.args;
    logger.info('Start(InitGameDemoService): ', { gameId, ipAddress });
    const AUTH_TOKEN = `${casinoSoftSwissAggregatorConfig.accessToken}`;
    const { casinoGame: casinoGameModel } = this.context.sequelize.models;

    try {
      const gameDetail = await casinoGameModel.findOne({
        where: {
          uniqueId: gameId,
          isActive: true
        },
        attributes: ['identifier', 'name', 'casino_provider_id']
      });
      if (!gameDetail) {
        logger.error('GameNotFound(InitGameDemoService)');
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
        }
      };
      let token = CryptoJS.HmacSHA256(JSON.stringify(parameters), AUTH_TOKEN).toString(encode);

      let endpointUrl = casinoSoftSwissAggregatorConfig.gcpUrl;
      /* move these to an enum for all games  and import it */
      if (gameId == process.env.CRASH_GAME_ID) {
        endpointUrl = originalConfig.crashURL;        
        token = CryptoJS.HmacSHA256(JSON.stringify(parameters), originalConfig.accessToken).toString(encode);
      } else if (gameId == "a66ba64e-63cd-40af-8f71-939547d062ac") {
        endpointUrl = originalConfig.plinkoUrl;        
        token = CryptoJS.HmacSHA256(JSON.stringify(parameters), originalConfig.accessToken).toString(encode);
      } else if (gameId == "ea2cafdb-21b3-4160-b3c4-044615b98bfb") {
        endpointUrl = originalConfig.blshUrl;
        token = CryptoJS.HmacSHA256(JSON.stringify(parameters), originalConfig.accessToken).toString(encode);
      }

      let finalUrl = `${endpointUrl}/demo`;
      const gameResponse = await axios.post(finalUrl, parameters, { headers: { "X-REQUEST-SIGN": token } });
      const result = {
        launchGameUrl: gameResponse?.data,
        gameName: gameDetail?.name,
      };
      logger.info('Return(InitGameDemoService): ', { result });
      return result;
    } catch (error) {
      logger.error('UnknonwError(InitGameDemoService): ', { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
