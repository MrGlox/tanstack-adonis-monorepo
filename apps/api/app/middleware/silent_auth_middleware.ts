import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import logger from '@adonisjs/core/services/logger'

/**
 * Silent auth middleware can be used as a global middleware to silent check
 * if the user is logged-in or not.
 *
 * The request continues as usual, even when the user is not logged-in.
 */
export default class SilentAuthMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
  ) {
    const requestId = ctx.request.id?.()
    const route = ctx.route?.pattern
    const method = ctx.request.method()
    const ip = ctx.request.ip()
    
    logger.debug('Silent auth middleware - Optional authentication check started', {
      requestId,
      route,
      method,
      ip,
      timestamp: new Date().toISOString()
    })

    await ctx.auth.check()
    
    const user = ctx.auth.user
    if (user) {
      logger.debug('Silent auth middleware - User authenticated', {
        requestId,
        route,
        method,
        ip,
        userId: user.id,
        userEmail: user.email?.toLowerCase(),
        timestamp: new Date().toISOString()
      })
    } else {
      logger.debug('Silent auth middleware - No authenticated user (continuing anyway)', {
        requestId,
        route,
        method,
        ip,
        timestamp: new Date().toISOString()
      })
    }

    return next()
  }
}