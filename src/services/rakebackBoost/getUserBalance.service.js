import { Alchemy } from "alchemy-sdk";
import { alchemyConfig } from '@src/configs'

import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { Cache, CacheStore } from '@src/libs/cache';

import { GetBalanceService } from "@src/services/rakebackBoost/getBalance.service";
import { Op } from "sequelize"
import { convertCryptoToFiat } from "@src/helpers/casino/softSwiss.helper";
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    userId: { type: 'string' },
    getUserRakebackBoostHandledTime: { type: 'string'}
  },
  required: ['userId']
})

export class GetUserBalanceService extends ServiceBase {
  get constraints() {
    return constraints
  }

  async run() {
    logger.info('============== Start GetUserBalanceService(User): ',{ args: this.args });
    const startGetUserBalanceService = new Date();
    const userId = this.args.userId;
    let currencyEveryRate = 0;
    const transaction = this.context?.sequelizeTransaction;

    const userData = await transaction.sequelize.models.user.findOne({
      attributes: ["id", "moreDetails"],
      where: { id: userId },
      transaction
    })

    if (!userData) {
      throw new APIError("Error: User Not Found");
    }

    const linked = userData?.moreDetails?.privyUser?.linkedAccounts;

    if (!linked)  {
      if (userData?.moreDetails?.defaultLinkedWalletAddress) {
        const updatedMoreDetails = {
          ...userData.moreDetails,
          defaultLinkedWalletAddress: null,
        };

        userData.moreDetails = updatedMoreDetails;

        await userData.save({transaction});
      }
      logger.info('============== Finish GetUserBalanceService(User): ', {date:new Date()});
      const finishGetUserBalanceService = new Date();
      return { ethBalance: 0, isWalletConnected: false, startGetUserBalanceService, finishGetUserBalanceService };
    }

    let walletAddress = userData?.moreDetails?.defaultLinkedWalletAddress;

    const walletDetailList = linked.filter(account => account.type === "wallet");
    if(!walletDetailList.length) {
      if (userData?.moreDetails?.defaultLinkedWalletAddress) {
        const updatedMoreDetails = {
          ...userData.moreDetails,
          defaultLinkedWalletAddress: null,
        };
        userData.moreDetails = updatedMoreDetails;
        await userData.save({transaction})
      }
      logger.info('==========1==== Finish GetUserBalanceService(User): ', {date:new Date(), userData:userData});
      const finishGetUserBalanceService = new Date();
      return { ethBalance: 0, isWalletConnected: false, startGetUserBalanceService, finishGetUserBalanceService };
    }

    const walletDetail = walletDetailList.filter(account => account?.address === walletAddress);
    if(!walletDetail?.length) {
      let defaultWallet = null;
      walletDetailList.forEach(element => {
        if (!defaultWallet || new Date(element?.latestVerifiedAt).getTime() > new Date(defaultWallet?.latestVerifiedAt).getTime()) {
          defaultWallet = element;
        }
      });

      walletAddress = defaultWallet?.address??null;
      const updatedMoreDetails = {
        ...userData.moreDetails,
        defaultLinkedWalletAddress: walletAddress,
      };
      userData.moreDetails = updatedMoreDetails;
      await userData.save({transaction})
    }

    if (!walletAddress)
      return { ethBalance: 0, isWalletConnected: false };

    const currencyRate = await transaction.sequelize.models.currency.findOne({
      where: {
        code: 'EVERY'
      }
    });

    if (currencyRate?.exchangeRate) {
      currencyEveryRate = currencyRate?.exchangeRate;
    }

    const cacheBalance = await Cache.get(CacheStore.redis, walletAddress);
    let balance = 0;
    let startAlchemyService = null;
    let finishAlchemyService = null;

    if (!cacheBalance?.fetchedAt || cacheBalance?.fetchedAt < Date.now() - alchemyConfig.cacheExpiresIn) {
      logger.info('============== Start AlchemyService(User): ',{date:new Date()});
      startAlchemyService = new Date();
      const alchemyEth = new Alchemy({ url: alchemyConfig.everyTokenRPCUrl });
      const alchemyBase = new Alchemy({ url: alchemyConfig.everyTokenBaseUrl });

      const result = await Promise.all([
        GetBalanceService.execute({ alchemy: alchemyEth, walletAddress: walletAddress, tokenAddress: alchemyConfig.everyETHAddress }),
        GetBalanceService.execute({ alchemy: alchemyBase, walletAddress: walletAddress, tokenAddress: alchemyConfig.everyBaseAddress })
      ]);
      logger.info('============== Finished AlchemyService(User): ', {date:new Date()});
      finishAlchemyService = new Date();

      const balanceETH = result[0]?.result;
      const balanceBase = result[1]?.result;

      const ethBalance = parseFloat(balanceETH) || 0;
      const baseBalance = parseFloat(balanceBase) || 0;

      balance = ethBalance + baseBalance;

      let expireDuration = alchemyConfig.cacheExpiresIn * 60;
      await Cache.set(CacheStore.redis, walletAddress, { balance: balance, fetchedAt: Date.now() }, expireDuration);
    }
    else {
      balance = cacheBalance?.balance;
    }

    const rakebackBoostLevel = await transaction.sequelize.models.rakebackBoostLevel.findOne({
      where: {
        balanceRequired: { [Op.lte]: convertCryptoToFiat(balance, currencyEveryRate) }
      },
      order: [['balanceRequired', 'DESC']]
    });

    const nextRakebackBoostLevel = await transaction.sequelize.models.rakebackBoostLevel.findOne({
      attributes: { exclude: ['createAt', 'updatedAt'] },
      where: {
        balanceRequired: { [Op.gt]: convertCryptoToFiat(balance, currencyEveryRate) }
      },
      order: [['balanceRequired', 'ASC']]
    });

    logger.info('============== Finished GetUserBalanceService(User): ', {date:new Date()});
    const finishGetUserBalanceService = new Date();

    return {
      ethBalance: balance,
      balance: convertCryptoToFiat(balance, currencyEveryRate),
      currencyEveryRate: currencyEveryRate,
      isWalletConnected: true,
      rakebackBoostLevel: rakebackBoostLevel,
      nextRakebackBoostLevel: nextRakebackBoostLevel,
      testLoggingTime: {
        startGetUserBalanceService,
        startAlchemyService,
        finishAlchemyService,
        finishGetUserBalanceService,
        getUserRakebackBoostHandledTime: this.args.getUserRakebackBoostHandledTime
      }
    };
  } catch(error) {
    throw new APIError(error)
  }
}
