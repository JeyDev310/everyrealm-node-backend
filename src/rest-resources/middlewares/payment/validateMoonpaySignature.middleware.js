import { logger } from "@src/utils/logger";
import crypto from "crypto";
import { errorTypes } from "@src/utils/constants/error.constants";
import { config } from '@src/configs/config';

/**
 * Middleware to validate MoonPay Webhook signature
 * @memberof Rest Middleware
 * @export
 * @name validateMoonpaySignature
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @return {*}
 */
export function validateMoonpaySignature(req, _res, next) {
  const body = req.body

  const moonpaySignature = req.headers["moonpay-signature-v2"];

  if (!moonpaySignature) {
    logger.warn("MoonPay Webhook: Missing signature header.");
    return next(errorTypes.MoonpaySignatureError);
  }

  try {
    const [timestampPart, signaturePart] = moonpaySignature.split(",");
    const timestamp = timestampPart.split("=")[1];
    const receivedSignature = signaturePart.split("=")[1];

    if (!timestamp || !receivedSignature) {
      logger.warn("MoonPay Webhook: Invalid signature format.");
      return next(errorTypes.MoonpaySignatureError);
    }

    const MOONPAY_WEBHOOK_KEY = config.get('moonpay.webhookKey');
    
    const computedSignature = crypto
      .createHmac("sha256", MOONPAY_WEBHOOK_KEY)
      .update(`${timestamp}.${JSON.stringify(body)}`)
      .digest("hex");

    logger.info("MoonPay Webhook Validation", {
      receivedSignature,
      computedSignature,
    });

    if (computedSignature !== receivedSignature) {
      logger.warn("MoonPay Webhook: Signature does not match.");
      return next(errorTypes.MoonpaySignatureError);
    }

    logger.info("MoonPay Webhook: Signature validated successfully.");

    next();

  } catch (e) {
    logger.error("MoonPay Webhook Signature Validation Error", { error: e });
    return next(e);
  }



}
