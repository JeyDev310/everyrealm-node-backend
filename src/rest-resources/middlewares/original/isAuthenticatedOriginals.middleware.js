import CryptoJS from 'crypto-js';
import { originalConfig } from '@src/configs/original.config';
import { logger } from '@src/utils/logger';

export const isAuthenticated = async (req, res, next) => {
  let token;
  const data = req.method === 'POST' ? req.body : req.query;
  const requestSign = req.headers['x-request-sign'];
  const timestamp = req.headers['x-timestamp'];
  const secretKey = originalConfig.accessToken; 

  if (!timestamp || Math.abs(Date.now() - Number(timestamp)) > 300000) {
    return res.status(403).json({
      code: 403,
      message: `Invalid or expired request timestamp.`,
    });
  }

  token = CryptoJS.HmacSHA512(JSON.stringify(data), secretKey).toString(CryptoJS.enc.Hex);

  logger.info('IsAuthenticated Data received:', { data });
  logger.info('Token and Request Signature:', { token, requestSign });

  if (token !== requestSign) {
    return res.status(403).json({
      code: 403,
      message: `Request signature doesn't match.`,
    });
  }

  next();
};