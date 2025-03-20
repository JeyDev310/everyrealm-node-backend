import { APIError } from '@src/errors/api.error'
import ajv from '@src/libs/ajv'
import ServiceBase from '@src/libs/serviceBase'
import { ethers } from "ethers";
import { logger } from "@src/utils/logger";

const constraints = ajv.compile({
  type: 'object',
  properties: {
    alchemy: { type: 'object' },
    walletAddress: { type: 'string' },
    tokenAddress: { type: 'string' },
  }
})

export class GetBalanceService extends ServiceBase {
  get constraints () {
    return constraints
  }

  async run () {

    let convertedBalance = 0;
    try {
      const response = await this.args.alchemy.core.getTokenBalances(this.args.walletAddress, [this.args.tokenAddress]);
      if (response.tokenBalances.length === 1) {
        let balance = response.tokenBalances[0].tokenBalance;
        convertedBalance = balance;
        convertedBalance = Number(ethers.formatEther(balance));
      }
    } catch (err) {
      logger.error(`Couldn't get balance of user ${this.args.walletAddress}: ${err}`);
      return 0;
    }

    return convertedBalance;
  } catch (error) {
    throw new APIError(error)
  }
}
