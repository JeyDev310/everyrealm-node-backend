import { sequelize } from "@src/database";
import AuthenticationError from "@src/errors/authentication.error";
import RequestInputValidationError from '@src/errors/requestInputValidation.error';
import { privy } from "@src/libs/privyClient";
import { GetSettingsService } from "@src/services/common/getSettings.service";
import { CheckAndUpdateAllLimits } from "@src/services/responsibleGambling/checkAndUpdateAllLimits.service";
import { LoginService } from "@src/services/user/login.service";
import { COOKIE_KEYS, SETTING_KEYS } from "@src/utils/constants/app.constants";
import { errorTypes } from "@src/utils/constants/error.constants";
import { logger } from '@src/utils/logger'

/**
 * @type {import('express').RequestHandler}
 */
export async function isAuthenticated(req, _, next) {
  try {

    // Check for various IDs in the request body
    if (req.body?.userId || req.body?.privyId) {
      return next(new RequestInputValidationError(errorTypes.SensitiveInformationInRequestBodyErrorType));
    }

    // Extract access token from the authorization header
    const accessToken = req.headers?.authorization?.substring(`${COOKIE_KEYS.ACCESS_TOKEN}=`.length) || "";

    // Verify the access token
    let verifiedClaims;
    try {
      verifiedClaims = await privy.verifyAuthToken(accessToken);
    } catch(err) {
      return next(new AuthenticationError(errorTypes.AuthenticationErrorType));
    }

    // Attach session ID to the request
    // NOTE: This is a total minomer.....calling the access token the session ID (these are two different things with two different values)
    // Leaving for now to avoid potentially breaking changes, but ideally should be fixed/correctly named at some point
    req.sessionID = accessToken;

    // Fetch existing User based on Privy ID
    let userDetails = await sequelize.models.user.findOne({
      where: { privyId: verifiedClaims?.userId },
      attributes: ["id", "isActive", "email"],
      include: [
        {
          attributes: ["id", "userId"],
          model: sequelize.models.wallet,
          where: { isDefault: true },
          include: [
            {
              attributes: ["id"],
              model: sequelize.models.currency,
              required: true,
            },
          ],
          required: true,
          separate: true,
        },
      ],
    });

    // If User doesn't already exist in our DB, create them
    if (!userDetails) {
      req.body.privyId = verifiedClaims?.userId
      const affiliateToken = req.headers['x-affiliate-token'];
      if (affiliateToken) req.body.affiliateToken = affiliateToken;
      // NOTE: Copied this helper function from @src/utils. Got errors when trying to import it
      function getIp (request) {
        const ip = request.headers['x-forwarded-for']?.split(',')[0] || request.ip || request.connection.remoteAddress
        return ip === '::1' || ip.includes('192.168') ? '1.1.1.1' : ip.includes('ffff') ? ip.split('::ffff:')[1] : ip
      }
      const result = await LoginService.execute({ ...req.body, ipAddress: getIp(req) }, req.context)
      userDetails = result?.user
    }

    // If still no User, throw an error
    if (!userDetails) {
      return next(new AuthenticationError(errorTypes.UserNotFoundErrorType));
    }
    
    if(userDetails.isActive === false) {
      return next(new AuthenticationError(errorTypes.UserInactiveErrorType));
    }
    // Only checking blocked domains for get-user route to reduce calls
    if(req.originalUrl.endsWith('/user/get-user')) {
      // Fetch blocked domains from settings
      const { result: settings } = await GetSettingsService.execute({ keys: [SETTING_KEYS.BLOCKED_DOMAINS] }, req.context);
      const blockedDomains = settings[SETTING_KEYS.BLOCKED_DOMAINS] || [];

      // Block users with specific email domains
      const userEmailDomain = userDetails.email?.split('@')[1];
      if (blockedDomains.includes(`@${userEmailDomain}`)) {
        return next(new AuthenticationError(errorTypes.UserInactiveErrorType));
      }
    }

    // Update responsible gambling limits
    await CheckAndUpdateAllLimits.execute(
      { userId: userDetails.id },
      req.context
    );

    // Attach authentication data to request
    req.authenticated = {
      userId: userDetails.id,
      userPrivyId: verifiedClaims?.userId,
      defaultWalletId: userDetails.wallets[0].id,
      defaultCurrencyId: userDetails.wallets[0].currency.id,
    };

    next();
  } catch (error) {
    logger.error("UnknownError(isAuthenticated):",  { message: error.message, stack: error.stack });
    next(error);
  }
}
