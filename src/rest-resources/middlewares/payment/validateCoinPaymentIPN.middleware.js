import { appConfig } from "@src/configs";
import { validateHMACSignature } from "@src/helpers/payment/coinPayments.helper";
import { errorTypes } from "@src/utils/constants/error.constants";
import AuthenticationError from "@src/errors/authentication.error";
import { logger } from "@src/utils/logger";

/**
 *
 * @memberof Rest Middleware
 * @export
 * @name validateCoinPaymentIPNMiddleware
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*}
 */
export function validateCoinPaymentIPNMiddleware(req, res, next) {
  const method = req.method;
  const url = `${appConfig.app.userBeUrl}/payment/coin-payments/webhook`;
  const coinpaymentSignature = req.headers["x-coinpayments-signature"];
  const date = req.headers["x-coinpayments-timestamp"];
  const data = req.body;

  try {
    const signature = validateHMACSignature(method, url, date, data);
    logger.info("our signature=", { message: signature });
    logger.info("coinpaymentSignature header=", {
      message: JSON.stringify(req.headers),
    });
    if (coinpaymentSignature === signature) return next();
    return next(errorTypes.HmacDoesNotMatchErrorType);
    // return next() // need to debug later
  } catch (e) {
    return next(e);
  }
}
