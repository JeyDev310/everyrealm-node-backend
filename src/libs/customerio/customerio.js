import {
  TrackClient,
  RegionUS,
  APIClient,
  SendEmailRequest
} from 'customerio-node'
import { appConfig, customerioConfig } from '@src/configs'
import { CUSTOMER_IO_TRANSACTION_ID } from '@src/utils/constants/app.constants'
import { sequelize } from '@src/database'
import { logger } from '@src/utils/logger'
const region = RegionUS
const cio = new TrackClient(
  customerioConfig.siteId,
  customerioConfig.trackApiKey,
  { region }
)

export const insertUpdate = (id, data) => {
  cio.identify(id, data)
}

export const event = (id, data) => {
  cio.track(id, data)
}

export const sendMail = async (args) => {
  const frontendHost = appConfig.app.userFeUrl || 'http://127.0.0.1'
  const client = new APIClient(customerioConfig.appApiKey, {
    region: RegionUS
  })
  let request

  const privacyLink = frontendHost + '/info/privacy-policy'

  const { customerIoTransactionId, userName, email, token, depositAmount, depositAddress, withdrawalAmount, withdrawalAddress, withdrawalCurrency, withdrawalNetwork, depositCurrency, depositNetwork, userId } = args

  const unsubscribeLink = frontendHost + '/unsubscribe?utm=' + userId
  switch (customerIoTransactionId) {
    // case CUSTOMER_IO_TRANSACTION_ID.VERIFY_MESSAGE_ID: {
    //   const verificationLink = frontendHost + "/verify-email?token=" + token;
    //   request = new SendEmailRequest({
    //     transactional_message_id: customerIoTransactionId,
    //     message_data: {
    //       link: verificationLink,
    //     },
    //     identifiers: {
    //       id: email,
    //     },
    //     to: email,
    //   });
    //   break;
    // }
    case CUSTOMER_IO_TRANSACTION_ID.DEPOSIT_SUCCESSFUL_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          amount: depositAmount,
          currency: depositCurrency,
          network: depositNetwork,
          address: depositAddress,
          play: frontendHost,
          privacy: privacyLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.DEPOSIT_UNSUCESSFUL_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          amount: depositAmount,
          currency: depositCurrency,
          network: depositNetwork,
          address: depositAddress,
          contact_support: contactSupportLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.SUCCESSFUL_DEPOSIT_CONFIRMATION_ID: {

      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          amount: depositAmount,
          currency: depositCurrency,
          network: depositNetwork,
          address: depositAddress,
          play: frontendHost,
        },
        identifiers: {
          id: email,
        },
        to: email,
      });

      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.TELEGRAM_CHANNEL_PROMOTION_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          deposit: depositLink,
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.EVERY_INFORMATION_PROMOTION_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          deposit: depositLink,
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.KYC_L1_VERIFICATION_ID: {

      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          email: email,
          play: frontendHost,
          privacy: privacyLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });

      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.KYC_L2_VERIFICATION_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          email: email,
          username: userName,
          play: frontendHost,
          privacy: privacyLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
    }
    case CUSTOMER_IO_TRANSACTION_ID.KYC_L2_VERIFICATION_REQUIED_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          email: email,
          username: userName,
          verified: frontendHost,
          privacy: privacyLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
    }
    case CUSTOMER_IO_TRANSACTION_ID.WITHDRAW_LIMIT_REACHED_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          email: email,
          username: userName,
          support: frontendHost,
          privacy: privacyLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
    }
    case CUSTOMER_IO_TRANSACTION_ID.WITHDRAWAL_PENDING_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          play: frontendHost,
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.WITHDRAWAL_SUCCESSFUL_ID: {

      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          amount: withdrawalAmount,
          currency: withdrawalCurrency,
          address: withdrawalAddress,
          network: withdrawalNetwork,
          play: frontendHost,
          privacy: privacyLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.WITHDRAWAL_UNSUCCESSFUL_ID: {


      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          amount: withdrawalAmount,
          currency: withdrawalCurrency,
          network: withdrawalNetwork,
          address: withdrawalAddress,
          contact_support: contactSupportLink,
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.WELCOME_EMAIL_ID: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          username: userName,
          email: email,
          deposit: frontendHost + '?wallet=open&tab=deposit',
          privacy: privacyLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
    case CUSTOMER_IO_TRANSACTION_ID.KYC_L2_VERIFICATION_RESUBMISSION: {
      request = new SendEmailRequest({
        transactional_message_id: customerIoTransactionId,
        message_data: {
          email: email,
          username: userName,
          resubmit: frontendHost,
          privacy: privacyLink,
          unsubscribe: unsubscribeLink
        },
        identifiers: {
          id: email,
        },
        to: email,
      });
      break;
    }
  }

  try {
    return await client.sendEmail(request)
  } catch (error) {
    logger.info(error.statusCode, error.message)
  }
}
