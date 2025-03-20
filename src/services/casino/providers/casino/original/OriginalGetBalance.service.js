import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper';
import ajv from '@src/libs/ajv';
import ServiceBase from '@src/libs/serviceBase';
import { USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES } from '@src/utils/constants/public.constants.utils'
import { dayjs } from '@src/libs/dayjs'
import { NumberPrecision } from '@src/libs/numberPrecision'
import { Op } from 'sequelize';

const constraints = ajv.compile({
  type: 'object',
  properties: {
    data: { type: 'array' },
  },
  required: ['data']
})

export class OriginalGetBalanceService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    try {
      const { currency: currencyModel, user: userModel, wallet: walletModel } = this.context.sequelize.models;

      const data = this.args.data;
      const userIds = [];
      const betAmounts = {};
      const currencyCodes = {};
      for (const callbackData of data) {
        const { userId, walletId, betAmount } = callbackData;
        const [uuid, currencyCode] = userId.split('_');
        userIds.push(uuid);
        betAmounts[uuid] = betAmount;
        currencyCodes[uuid] = currencyCode;
      }

      const users = await userModel.findAll({
        where: { uniqueId: { [Op.in]: userIds }, isActive: true },
        attributes: ["id", "uniqueId"],
        include: [{
          attributes: ["id", "userId", "amount", "withdrawableAmount"],
          model: walletModel,
          where: { isDefault: true },
          include: {
            attributes: ["id", "code", "exchangeRate"],
            where: { isActive: true },
            model: currencyModel,
            required: true,
          },
          required: true,
          separate: true,
        },
        {
          model: this.context.sequelize.models.userLimit,
          where: {
            key: {
              [Op.in]: [
                USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.DAILY_BET_LIMIT,
                USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.WEEKLY_BET_LIMIT,
                USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES.MONTHLY_BET_LIMIT
              ]
            }
          },
          required: false
        }]
      });
      const results = {};

      for (const user of users) {
        const amount = user.wallets[0]?.amount ?? 0;
        const withdrawableAmount = user.wallets[0]?.withdrawableAmount ?? 0;
        const exchangeRate = user.wallets[0]?.currency?.exchangeRate ?? 1;
        const euro_balance = convertCryptoToFiat(amount + withdrawableAmount, exchangeRate);
        const uniqueId = user.uniqueId;
        const betAmount = (Number)(betAmounts[uniqueId]);
        const currencyCode = currencyCodes[uniqueId];

        let maxBet = 100;
        let status = true;
        let message = '';

        if (betAmount > euro_balance) {
          status = false;
          message = 'Insufficient fund';
        }

        if (betAmount > maxBet) {
          status = false;
          message = 'Bet limit exceeds';
        }

        for (const limit of user.userLimits) {
          if (dayjs().isAfter(limit.expireAt)) {
            limit.currentValue = 0
            limit.expireAt = getExpireAt(limit.key, limit.expireAt)
          }
          const totalLimitAmount = NumberPrecision.plus(limit.currentValue, betAmount)
          if (+limit.value && totalLimitAmount > limit.value) {
            status = false;
            message = 'Bet limit exceeds';
          }
        }

        results[`${uniqueId}_${currencyCode}`] = { status, balance: euro_balance, message };
      }

      return { statusCode: 200, status: true, results }
    } catch (error) {
      logger.error('UnknownError(OriginalGetBalanceService):', { message: error.message, stack: error.stack });
      return casinoErrorTypes.UNKNOWN_ERROR;
    }
  }
}
