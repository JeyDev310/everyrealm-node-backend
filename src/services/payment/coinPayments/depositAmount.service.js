import { appConfig } from '@src/configs';
import { APIError } from '@src/errors/api.error';
import { checkDepositLimit } from '@src/helpers/common.helper';
import ajv from '@src/libs/ajv';
import { CoinPaymentAxios } from '@src/libs/axios/coinPayments.axios';
import ServiceBase from '@src/libs/serviceBase';
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    currencySymbol: { type: 'string', default: 'LTCT' },
    tokenSymbol: { type: 'string' },
    userId: { type: 'number' },
  },
  required: ['userId', 'currencySymbol']
});

export class CoinPayDepositAmountService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    try {
      logger.info("Deposit received with the following args ", { args: this.args });
      const { tokenSymbol, userId } = this.args;
      let { currencySymbol } = this.args;
      let currencySymbolOnCoinPayments = this.args.currencySymbol

      logger.info('Start(CoinPayDepositAmountService):', { currencySymbol, tokenSymbol, userId });
      const transaction = this.context.sequelizeTransaction

      let include = [];
      if (tokenSymbol) {
        currencySymbolOnCoinPayments += (currencySymbol !== tokenSymbol) ? `.${tokenSymbol}` : '';
        include.push({
          model: this.context.sequelize.models.cryptoToken,
          where: { symbol: tokenSymbol },
        });
      }

      const currencyAddress = await this.context.sequelize.models.cryptoWalletAddress.findOne({ where: { symbol: currencySymbolOnCoinPayments } });
      if (!currencyAddress) {
        logger.error('CurrencyAddressNotAvailable(CoinPayDepositAmountService)')
        return this.addError('CurrencyNotAvailableErrorType');
      }

      const currency = await this.context.sequelize.models.currency.findOne({
        where: { code: currencySymbol },
        include
      });
      if (!currency) {
        logger.error('CurrencyNotAvailable(CoinPayDepositAmountService)')
        return this.addError('CurrencyNotAvailableErrorType');
      }

      const limitExceed = await checkDepositLimit(userId, this.context);
      if (limitExceed) {
        logger.error('CustomizedDepositLimit(CoinPayDepositAmountService)');
        return this.addError('PlayerReachedCustomizedDepositLimit');
      }

      let query = {
        currencyId: currency.id,
        isActive: true,
        userId,
      };
      if (tokenSymbol)
        query.tokenId = currency.cryptoTokens[0].id;
      const userAddress = await this.context.sequelize.models.usersDepositAddress.findOne({
        where: query,
        include
      });
      if (userAddress) {
        logger.info('Return(CoinPayDepositAmountService): ', { userNetworkAddress: userAddress.networkAddress });
        return { networkAddress: userAddress.networkAddress };
      }

      const endPoints = `/merchant/wallets/${currencyAddress.walletId}/addresses?label=User${userId}address&notificationUrl=${process.env.COIN_PAYMENTS_WEBHOOK_URL}`;
      const addressResponse = await CoinPaymentAxios.createDepositAddress(endPoints);
      const response = JSON.parse(addressResponse?.data);
      await this.context.sequelize.models.usersDepositAddress.create({
        addressId: response.addressId,
        currencyId: currency.id,
        networkAddress: response.networkAddress,
        tokenId: tokenSymbol ? currency.cryptoTokens[0].id : null,
        userId,
      }, { transaction });
      logger.info('Return(CoinPayDepositAmountService):', { networkAddress: response.networkAddress });
      return { networkAddress: response.networkAddress };
    } catch (error) {
      logger.error('UnknownError(CoinPayDepositAmountService):', { message: error.message, stack: error.stack });
      throw new APIError(error)
    }
  }
}
