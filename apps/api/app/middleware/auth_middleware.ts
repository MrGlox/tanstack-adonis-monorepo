import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { Authenticators } from '@adonisjs/auth/types'
import logger from '@adonisjs/core/services/logger'

/**
 * Auth middleware is used authenticate HTTP requests and deny
 * access to unauthenticated users.
 */
export default class AuthMiddleware {
  /**
   * The URL to redirect to, when authentication fails
   */
  redirectTo = '/login'

  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      guards?: (keyof Authenticators)[]
    } = {}
  ) {
    const requestId = ctx.request.id?.()
    const route = ctx.route?.pattern
    const method = ctx.request.method()
    const ip = ctx.request.ip()
    
    logger.info('Auth middleware - Authentication check started', {
      requestId,
      route,
      method,
      ip,
      guards: options.guards,
      timestamp: new Date().toISOString()
    })

    try {
      await ctx.auth.authenticateUsing(options.guards, { loginRoute: this.redirectTo })
      
      const user = ctx.auth.user
      logger.info('Auth middleware - Authentication successful', {
        requestId,
        route,
        method,
        ip,
        userId: user?.id,
        userEmail: user?.email?.toLowerCase(),
        guards: options.guards,
        timestamp: new Date().toISOString()
      })
      
      return next()
    } catch (error) {
      logger.warn('Auth middleware - Authentication failed', {
        requestId,
        route,
        method,
        ip,
        error: error.message,
        guards: options.guards,
        timestamp: new Date().toISOString()
      })
      
      throw error
    }
  }
}