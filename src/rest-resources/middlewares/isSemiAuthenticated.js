import { isAuthenticated } from './isAuthenticated'

/**
 * @type {import('express').RequestHandler}
 */
export async function isSemiAuthenticated (req, res, next) {
  try {
    if (req.headers?.authorization) {
      await isAuthenticated(req, res, next)
    } else {
      next()
    }
  } catch { }
}
