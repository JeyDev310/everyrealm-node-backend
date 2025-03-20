import { config } from '@src/configs/config';
import { APIError } from '@src/errors/api.error';
import { updateDepositLimit } from '@src/helpers/common.helper';
import ajv from '@src/libs/ajv';
import { sendMail } from '@src/libs/customerio/customerio';
import ServiceBase from '@src/libs/serviceBase';
import { GetSettingsService } from '@src/services/common/getSettings.service';
import { transactionExplorerUrlGenerator } from '@src/services/helper/explorerUrl';
import { emitUserWithdraw } from '@src/socket-resources/emitters/withdraw.emitter';
import { currecyIdToCode, CUSTOMER_IO_TRANSACTION_ID, SETTING_KEYS } from '@src/utils/constants/app.constants';
import { PAYMENT_PROVIDERS, TRANSACTION_STATUS } from '@src/utils/constants/payment.constants';
import { COINPAYMENT_DEPOSIT, COINPAYMENT_WITHDRAW, WEBHOOK_RESPONSE } from '@src/utils/constants/paymentProviders/coinPayment.constants';
import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils';
import { logger } from "@src/utils/logger";
import { sendSlackMessage } from '@src/utils/slack.util';
import { CreatePaymentTransactionService } from '../createPaymentTransaction.service';
import { convertCryptoToFiat } from '@src/helpers/casino/softSwiss.helper'
// import { coinPaymentConversion } from '@src/helpers/payment/coinPayments.helper'

const constraints = ajv.compile({
  type: 'object',
  properties: {
    walletId: { type: 'string' },
    address: { type: 'string' },
    transactionId: { type: 'string' },
    txHash: { type: 'string' },
    transactionType: { type: 'string' },
    amount: { type: 'string' },
    symbol: { type: 'string' },
    nativeAmount: { type: 'string' },
    nativeSymbol: { type: 'string' },
    confirmations: { type: 'string' },
    requiredConfirmations: { type: 'string' },
    spendRequestId: { type: 'string', default: null }
  },
  required: ['address', 'transactionId']
});

export class CoinPayWebhookService extends ServiceBase {
  get constraints() {
    return constraints;
  }

  async run() {
    const { address, amount, confirmations, nativeAmount, requiredConfirmations, spendRequestId, symbol, transactionId, transactionType, txHash } = this.args;
    logger.info('Start(CoinPayWebhookService):', { address, amount, confirmations, nativeAmount, requiredConfirmations, spendRequestId, symbol, transactionId, transactionType, txHash });
    const coinSymbol = symbol.split('.')[0];
    const sequlizeTransaction = this.context.sequelizeTransaction;
    try {
      if (COINPAYMENT_DEPOSIT.includes(transactionType)) {
        const addressData = await this.context.sequelize.models.usersDepositAddress.findOne({
          where: {
            networkAddress: address,
            isActive: true
          }
        });
        if (!addressData) {
          logger.error('AddressNotFound(CoinPayWebhookService)');
          return WEBHOOK_RESPONSE.ADDRESS_NOT_FOUND;
        }

        const userId = addressData.userId;
        const user = await this.context.sequelize.models.user.findOne({
          where: { id: userId },
          attributes: ['email', 'id', 'username', 'moreDetails'],
          include: {
            model: this.context.sequelize.models.wallet,
            include: {
              model: this.context.sequelize.models.currency,
              where: { code: coinSymbol },
              attributes: ['code', 'id', 'exchangeRate']
            }
          },
          transaction: sequlizeTransaction
        });
        if (!user) {
          logger.error('UserNotFound(CoinPayWebhookService)');
          return WEBHOOK_RESPONSE.USER_NOT_FOUND;
        }

        if (requiredConfirmations === confirmations) {
          const transaction = await this.context.sequelize.models.transaction.findOne({ where: { paymentId: transactionId } });
          if (transaction) {
            logger.error('TransactionAlreadyProcessed(CoinPayWebhookService)');
            return WEBHOOK_RESPONSE.IPN_ALREADY_PROCESSED;
          }

          const paymentProvider = await this.context.sequelize.models.paymentProvider.findOne({
            where: { aggregator: PAYMENT_PROVIDERS.COINPAYMENTS },
            attributes: ['id']
          });
          // if (symbol.includes('.')) {
          //   amount = await coinPaymentConversion(this.context, amount, symbol, user?.wallets[0]?.currency?.code);
          // }
          await updateDepositLimit(user.id, +nativeAmount, this.context);

          let exchangeRate
          let fiatAmount = +nativeAmount
          if (!fiatAmount) {
            const currencyId = addressData.currencyId
            const currency = await this.context.sequelize.models.currency.findOne({ where: { id: currencyId } });
            if (!currency) {
              logger.error('CreateTransactionService: currency not found', { userId, currencyId })
              return this.addError('CurrencyNotFoundErrorType')
            }
            exchangeRate = currency.exchangeRate;
            fiatAmount = convertCryptoToFiat(amount, exchangeRate)
          } else {
            exchangeRate = amount / fiatAmount;
          }

          const { result: ledger } = await CreatePaymentTransactionService.execute(
            {
              amount,
              exchangeRate,
              fiatAmount,
              moreDetails: { ...this.args },
              paymentId: transactionId,
              paymentProviderId: paymentProvider.id,
              purpose: LEDGER_PURPOSE.DEPOSIT,
              status: TRANSACTION_STATUS.COMPLETED,
              userId: user.id,
              walletId: user?.wallets[0].id,
            },
            this.context
          );

          const userDepositCount = await this.context.sequelize.query(
            `select count(*) from transactions as t join ledgers as l on t.ledger_id = l.id where l.purpose = '${LEDGER_PURPOSE.DEPOSIT}' and t.user_id = ${user.id} and payment_id is not null;`,
            { logging: true }
          );



          logger.info('CoinPayWebhookService -> run -> ledger', { ledger });
          const payload = {
            customerIoTransactionId: CUSTOMER_IO_TRANSACTION_ID.DEPOSIT_SUCCESSFUL_ID,
            depositAddress: address,
            depositAmount: amount,
            depositCurrency: coinSymbol,
            depositNetwork: symbol,
            email: user?.email,
            userId: user.id,
            userName: user?.username,
          };
          await sendMail(payload);
          await sendSlackMessage(
            `Deposit Successful - ${payload.userName} - ${payload.email}\n
            Deposit Amount: ${payload.depositAmount}\n
            Deposit Currency: ${payload.depositCurrency}\n
            Deposit Network: ${payload.depositNetwork}\n
            Status: Confirmed\n
            CoinPayment Transaction ID: ${transactionId}\n
            Blockexplorer: ${transactionExplorerUrlGenerator(txHash, coinSymbol)}`,
            config.get("slack.paymentChannelId")
          );
          logger.info("--------------------------SLACK NOTIFICATION COINPAY WEBHOOK --------------------------")
        }
      }
      if (COINPAYMENT_WITHDRAW.includes(transactionType)) {
        const transaction = await this.context.sequelize.models.transaction.findOne({
          where: { withdrawSpentId: spendRequestId, status: TRANSACTION_STATUS.PENDING },
          include: {
            attributes: ['username', 'id', 'email'],
            model: this.context.sequelize.models.user,
            include: {
              attributes: ['id'],
              model: this.context.sequelize.models.wallet,
              include: {
                model: this.context.sequelize.models.currency,
                where: { code: coinSymbol },
                attributes: ['name', 'id'],
                required: true
              }
            }
          }
        });
        if (!transaction) {
          logger.error('PaymentNotFound(CoinPayWebhookService)');
          return WEBHOOK_RESPONSE.PAYMENT_NOT_FOUND;
        }

        if (requiredConfirmations === confirmations) {
          transaction.status = TRANSACTION_STATUS.COMPLETED;
          transaction.paymentId = transactionId;
          transaction.moreDetails = { ...transaction.moreDetails, webhookData: this.args };
          await transaction.save({ transaction: sequlizeTransaction });

          const [withdrawalCurrency, withdrawalNetwork] = symbol.split('.');
          emitUserWithdraw(transaction?.user?.id, {
            address: address,
            amount: amount,
            currency: withdrawalCurrency,
            network: withdrawalNetwork,
          });

          // Updating global totalWithdrawals
          const coinSymbol = symbol.split('.')[0];
          const currencyCode = await this.context.sequelize.models.currency.findOne({ where: { code: coinSymbol }, attributes: ['id'] });
          const { result: settings } = await GetSettingsService.execute({}, this.context);
          const totalWithdrawals = JSON.parse(settings.totalWithdrawals);
          const updatedValue = { ...totalWithdrawals, currencyCode: totalWithdrawals[currencyCode] + amount };

          await this.context.sequelize.models.setting.update(
            { value: JSON.stringify(updatedValue) },
            {
              where: { key: SETTING_KEYS.TOTAL_WITHDRAWALS }
            });

          const payload = {
            customerIoTransactionId: CUSTOMER_IO_TRANSACTION_ID.WITHDRAWAL_SUCCESSFUL_ID,
            email: transaction?.user.email,
            userId: transaction?.user?.id,
            userName: transaction?.user?.username,
            withdrawalAddress: address,
            withdrawalAmount: amount,
            withdrawalCurrency: transaction?.user?.wallets[0].currency.name,
            withdrawalNetwork: symbol,
          };
          await sendMail(payload);
          await sendSlackMessage(
            `Withdrawal Successful - ${payload.userName} - ${payload.email}\n
             Withdrawal Amount: ${payload.withdrawalAmount}\n
             Withdrawal Currency: ${payload.withdrawalCurrency}\n
             Withdrawal Network: ${payload.withdrawalNetwork}\n
             Status: Confirmed\n
             OW Transaction ID: ${transaction.id}\n
             CoinPayment Transaction ID: ${transaction.paymentId}
             Blockexplorer: ${transactionExplorerUrlGenerator(txHash, coinSymbol)}`,
            config.get("slack.paymentChannelId")
          );
        }
      }

      logger.info('Return(CoinPayWebhookService)');
      return WEBHOOK_RESPONSE.IPN_PROCESSED;
    } catch (error) {
      logger.error('UnknownError(CoinPayWebhookService):', { message: error.message, stack: error.stack });
      throw new APIError(error);
    }
  }
}
