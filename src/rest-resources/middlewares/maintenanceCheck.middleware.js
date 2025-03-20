import { sequelize } from '@src/database'
import SiteUnderMaintenanceError from '@src/errors/siteUnderMaintenance.error'
import { SETTING_KEYS } from '@src/utils/constants/app.constants'

/**
 * Middleware to check if the site is under maintenance.
 * If maintenance mode is enabled, it throws a `SiteUnderMaintenanceError`.
 *
 * @type {import('express').Handler}
 */
export async function maintenanceCheckMiddleware(req, _, next) {
  try {
    // Fetch the maintenance setting from the database
    const maintenanceSetting = await sequelize.models.setting.findOne({
      where: { key: SETTING_KEYS.MAINTENANCE },
    })

    // Check if the maintenance mode is enabled
    if (maintenanceSetting?.value === 'true') {
      return next(new SiteUnderMaintenanceError())
    }

    // Proceed to the next middleware if not under maintenance
    next()
  } catch (error) {
    // Handle unexpected database errors gracefully
    next(error)
  }
}
