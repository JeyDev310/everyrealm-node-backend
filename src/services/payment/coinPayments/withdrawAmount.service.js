import Big from 'big.js';
import { APIError } from "@src/errors/api.error";
import { convertCryptoToFiat } from "@src/helpers/casino/softSwiss.helper";
import ajv from "@src/libs/ajv";
import { CoinPaymentAxios } from "@src/libs/axios/coinPayments.axios";
import { sendMail } from "@src/libs/customerio/customerio";
import { NumberPrecision } from "@src/libs/numberPrecision";
import ServiceBase from "@src/libs/serviceBase";
import { CheckWithdrawalLimits } from "@src/services/responsibleGambling/checkWithdrawalLimits.service";
import { ADDITIONAL_VERIFICATION_LEVELS, CUSTOMER_IO_TRANSACTION_ID, VERIFF_STATUS, WITHDRAWAL_AMOUNT_LEVELS } from "@src/utils/constants/app.constants";
import {
  PAYMENT_PROVIDERS,
  TRANSACTION_STATUS,
} from "@src/utils/constants/payment.constants";
import { LEDGER_PURPOSE, WITHDRAWAL_STATUS, WITHDRAWAL_TYPES } from "@src/utils/constants/public.constants.utils";
import { CreatePaymentTransactionService } from "../createPaymentTransaction.service";
import { sendSlackMessage } from "@src/utils/slack.util";
import { config } from "@src/configs/config";
import { logger } from "@src/utils/logger";
import { v4 as uuid } from 'uuid';

const constraints = ajv.compile({
  type: "object",
  properties: {
    amount: { type: "number" },
    userId: { type: "number" },
    walletId: { type: "number" },
    address: { type: "string" },
    network: { type: "string" },
    currencySymbol: { type: 'string' },
    tokenSymbol: { type: 'string' },
  },
  required: ["amount", "walletId", "address"],
});

export class CoinPayWithdrawAmountService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { address } = this.args
    const amount = this.args.amount
    const network = this.args.network
    const userId = this.args.userId
    let currencySymbol = this.args.currencySymbol
    let tokenSymbol = this.args.tokenSymbol
    if (tokenSymbol) {
      currencySymbol += (currencySymbol !== tokenSymbol) ? `.${tokenSymbol}` : '';
    }
    try {
      const user = await this.context.sequelize.models.user.findOne({
        attributes: ['id', 'username', 'veriffStatus', 'moreDetails', 'email', 'lockWithdrawals'],
        where: { id: this.args.userId }
      })

      if (user.lockWithdrawals) return this.addError('WithdrawalNotAllowedErrorType')

      const wallet = await this.context.sequelize.models.wallet.findOne({
      where: { id: this.args.walletId, userId: this.args.userId },
      attributes: ["currencyId", "amount", "userId", "id", 'withdrawableAmount'],
      include: {
        model: this.context.sequelize.models.currency,
        attributes: ['code', 'exchangeRate', 'withdrawalFees', 'minWithdrawalAmount']
      },
      required: true
      })

      if (!wallet) return this.addError('InvalidWalletIdErrorType')

      const exchangeRate = wallet.currency.exchangeRate

      // const userDepositSumFiat = await this.context.sequelize.query(`select sum(l.fiat_amount) from transactions as t join ledgers as l on t.ledger_id = l.id where l.purpose = '${LEDGER_PURPOSE.DEPOSIT}' and t.user_id = ${this.args.userId};`, { logging: true })

      const userWithdrawalSumFiat = await this.context.sequelize.query(`select sum(l.fiat_amount) from transactions as t join ledgers as l on t.ledger_id = l.id where l.purpose = '${LEDGER_PURPOSE.WITHDRAW}' and t.user_id = ${this.args.userId};`, { logging: true })

      if(+userWithdrawalSumFiat[0][0].sum + convertCryptoToFiat(amount, exchangeRate) > WITHDRAWAL_AMOUNT_LEVELS.STATIC_LEVEL1_WITHDRAWAL_LIMIT_IN_EURO && user.veriffStatus != VERIFF_STATUS.APPROVED) {
        return this.addError('Level2RequiredErrorType') // kyc level 2 require prior withdrawal when withdrawal count >= 2000
      }

      if(+userWithdrawalSumFiat[0][0].sum + convertCryptoToFiat(amount, exchangeRate) > WITHDRAWAL_AMOUNT_LEVELS.STATIC_LEVEL2_WITHDRAWAL_LIMIT_IN_EURO && user.moreDetails.additionalVerification != ADDITIONAL_VERIFICATION_LEVELS.VERIFIED) {
        return this.addError('Level3RequiredErrorType') // kyc level 3 require prior withdrawal when withdrawal count >= 5000
      }

      if (+userWithdrawalSumFiat[0][0].sum >= WITHDRAWAL_AMOUNT_LEVELS.STATIC_LEVEL1_WITHDRAWAL_LIMIT_IN_EURO && user.veriffStatus != VERIFF_STATUS.APPROVED) {

        await user.set({ moreDetails: { ...user.moreDetails, additionalVerification: ADDITIONAL_VERIFICATION_LEVELS.LEVEL2_REQUIRED } }).save({})
        const payload = {
          userName: user.username,
          email: user.email,
          customerIoTransactionId: CUSTOMER_IO_TRANSACTION_ID.KYC_L2_VERIFICATION_REQUIED_ID,
          userId: user.id
        };
        await sendMail(payload);
        return this.addError('Level2RequiredErrorType') // kyc level 2 require prior withdrawal when withdrawal count >= 2000
      }

      if (+userWithdrawalSumFiat[0][0].sum >= WITHDRAWAL_AMOUNT_LEVELS.STATIC_LEVEL2_WITHDRAWAL_LIMIT_IN_EURO && user.moreDetails.additionalVerification == ADDITIONAL_VERIFICATION_LEVELS.LEVEL3_REQUIRED){
        const payload = {
          userName: user.username,
          email: user.email,
          customerIoTransactionId: CUSTOMER_IO_TRANSACTION_ID.WITHDRAW_LIMIT_REACHED_ID,
          userId: user.id
        };
        await sendMail(payload);
        return this.addError('Level3RequiredErrorType') // kyc level 3 require prior withdrawal when withdrawal count >= 5000

      }

      // fetching deposit count for this user
      const userDepositCount = await this.context.sequelize.query(
        `select count(*) from transactions as t join ledgers as l on t.ledger_id = l.id where l.purpose = '${LEDGER_PURPOSE.DEPOSIT}' and t.user_id = ${user.id};`,
        { logging: true }
      );
      // sending slack message & throwing error in case of no deposits.
      if(+userDepositCount[0][0].count < 1) {
        await sendSlackMessage(
          `User trying to withdraw without any deposits - ${user.username} - ${user.email}\n
          Withdrawal Amount: ${amount}\n
          Withdrawal Currency: ${wallet.currency?.code}\n
          Withdrawal Network: ${network}\n`,
          config.get("slack.paymentChannelId")
        );
        return this.addError('NotEnoughAmountErrorType')
      }

      if (this.args.amount > wallet.withdrawableAmount) return this.addError('NotEnoughAmountErrorType')
          
      const currencyAddress = await this.context.sequelize.models.cryptoWalletAddress.findOne({
        where: { symbol: currencySymbol }
      })
      if (!currencyAddress) return this.addError('CurrencyNotAvailableErrorType')

      const result = await CheckWithdrawalLimits.execute({
        walletId: wallet.id,
        userId: user.id,
        amount: amount
      }, this.context)

      if (!result.success) {
        if (result?.errors?.CheckWithdrawalLimits?.WithdrawalLimitForAllCurrenciesExceededErrorType) {
          return this.addError('WithdrawalLimitForAllCurrenciesExceededErrorType')
        } else if (result?.errors?.CheckWithdrawalLimits?.WithdrawalLimitExceededErrorType) {
          return this.addError('WithdrawalLimitExceededErrorType')
        } else if (result?.errors?.CheckWithdrawalLimits?.AllCurrenciesWithdrawalLimitExceededErrorType) {
          return this.addError('AllCurrenciesWithdrawalLimitExceededErrorType')
        } else if (result?.errors?.CheckWithdrawalLimits?.AllCurrenciesDailyWithdrawalLimitExceededErrorType) {
          return this.addError('AllCurrenciesDailyWithdrawalLimitExceededErrorType')
        } else if (result?.errors?.CheckWithdrawalLimits?.CurrencySpecificWithdrawalLimitExceededErrorType) {
          return this.addError('CurrencySpecificWithdrawalLimitExceededErrorType')
        } else if (result?.errors?.CheckWithdrawalLimits?.CurrencySpecificDailyWithdrawalLimitExceededErrorType) {
          return this.addError('CurrencySpecificDailyWithdrawalLimitExceededErrorType')
        }
      }

      const paymentProvider =
        await this.context.sequelize.models.paymentProvider.findOne({
          where: { aggregator: PAYMENT_PROVIDERS.COINPAYMENTS },
          attributes: ["id", "name"],
        });

      let withdrawalfees;
      if (network) {
        withdrawalfees = wallet.currency?.withdrawalFees[network] || 0
      }

      const {result: transactionEntry} = await CreatePaymentTransactionService.execute(
        {
          userId: wallet.userId,
          fees: withdrawalfees,
          paymentProviderId: paymentProvider.id,
          paymentId: uuid(),
          amount: amount,
          walletId: wallet.id,
          purpose: LEDGER_PURPOSE.WITHDRAW,
          status: TRANSACTION_STATUS.PENDING,
          network: network,
          fiatAmount: convertCryptoToFiat(amount, exchangeRate),
          exchangeRate
        },
        this.context
      )

      const withdrawalRequestTransaction = await this.context.sequelize.models.transaction.findOne({
        where: { ledgerId: transactionEntry.id },
        attributes: ['id'],
        transaction: this.context.sequelizeTransaction
      })

      const withdrawal = await this.context.sequelize.models.withdrawal.create({
        ledgerId: transactionEntry.id,
        transactionId: withdrawalRequestTransaction.id,
        userId,
        status: WITHDRAWAL_STATUS.PENDING,
        type: WITHDRAWAL_TYPES.CRYPTO,
        amount,
        withdrawalAddress: address, 
        currencySymbol: currencySymbol, 
        walletId: wallet?.id,
        paymentProviderId: paymentProvider.id,
        withdrawalFee: withdrawalfees,
      }, { transaction: this.context.sequelizeTransaction })

      await sendSlackMessage(
        `Withdrawal Requested - ${user.username} - ${user.email}\n
         Withdrawal Amount: ${amount}\n
         Withdrawal Currency: ${wallet.currency?.code}\n
         Withdrawal Network: ${network}\n
         Status: Pending\n`,
        config.get("slack.paymentChannelId")
      );

      if ((+userWithdrawalSumFiat[0][0].sum + convertCryptoToFiat(amount, exchangeRate)) >= WITHDRAWAL_AMOUNT_LEVELS.STATIC_LEVEL2_WITHDRAWAL_LIMIT_IN_EURO && user.moreDetails.additionalVerification == ADDITIONAL_VERIFICATION_LEVELS.NOT_REQUIRED && user.veriffStatus != VERIFF_STATUS.APPROVED) { // static check for level 3 kyc
        await user.set({ moreDetails: { ...user.moreDetails, additionalVerification: ADDITIONAL_VERIFICATION_LEVELS.LEVEL2_REQUIRED } }).save({})
      } else if ((+userWithdrawalSumFiat[0][0].sum + convertCryptoToFiat(amount, exchangeRate)) >= WITHDRAWAL_AMOUNT_LEVELS.STATIC_LEVEL2_WITHDRAWAL_LIMIT_IN_EURO && user.moreDetails.additionalVerification == ADDITIONAL_VERIFICATION_LEVELS.NOT_REQUIRED) { // static check for level 3 kyc
        const payload = {
          userName: user.username,
          email: user.email,
          customerIoTransactionId: CUSTOMER_IO_TRANSACTION_ID.WITHDRAW_LIMIT_REACHED_ID,
          userId: user.id
        };
        await sendMail(payload);
        await user.set({ moreDetails: { ...user.moreDetails, additionalVerification: ADDITIONAL_VERIFICATION_LEVELS.LEVEL3_REQUIRED } }).save({})
      }
      return { response: withdrawal };
    } catch (error) {
      throw new APIError(error);
    }
  }
}
