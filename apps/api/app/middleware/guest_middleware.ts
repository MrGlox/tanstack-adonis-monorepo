import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import logger from '@adonisjs/core/services/logger'

/**
 * Guest middleware is used to deny access to routes that should
 * be accessed by unauthenticated users.
 *
 * For example, the login page should not be accessible if the user
 * is already logged-in
 */
export default class GuestMiddleware {
  /**
   * The URL to redirect to when user is logged-in
   */
  redirectTo = '/'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { guards?: (keyof Authenticators)[] } = {}
  ) {
    const requestId = ctx.request.id?.()
    const route = ctx.route?.pattern
    const method = ctx.request.method()
    const ip = ctx.request.ip()
    
    logger.debug('Guest middleware - Checking if user should be denied access (guest-only route)', {
      requestId,
      route,
      method,
      ip,
      guards: options.guards,
      timestamp: new Date().toISOString()
    })

    for (let guard of options.guards || [ctx.auth.defaultGuard]) {
      if (await ctx.auth.use(guard).check()) {
        const user = ctx.auth.use(guard).user
        
        logger.info('Guest middleware - Authenticated user denied access to guest-only route', {
          requestId,
          route,
          method,
          ip,
          userId: user?.id,
          userEmail: user?.email?.toLowerCase(),
          guard,
          redirectTo: this.redirectTo,
          timestamp: new Date().toISOString()
        })
        
        return ctx.response.redirect(this.redirectTo, true)
      }
    }

    logger.debug('Guest middleware - Access allowed to guest-only route', {
      requestId,
      route,
      method,
      ip,
      guards: options.guards,
      timestamp: new Date().toISOString()
    })

    return next()
  }
}