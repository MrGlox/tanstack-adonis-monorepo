import type { HttpContext } from '@adonisjs/core/http'
import { ApiOperation, ApiBody, ApiResponse } from '@foadonis/openapi/decorators'

import User from '#models/user'
import { loginValidator } from '#validators/user'

export default class AuthenticationController {
  /**
   * Authenticate a user (login)
   */
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiBody({ type: () => loginValidator })
  @ApiResponse({ type: User })
  async login({ request, auth, response, i18n }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)
      
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      
      return {
        message: i18n.t('sessions.login.success'),
        user: user.serialize()
      }
    } catch (error) {
      return response.status(401).json({
        message: i18n.t('sessions.login.invalid_credentials')
      })
    }
  }

  /**
   * Logout the current user
   */
  @ApiOperation({ summary: 'Logout the current user' })
  @ApiResponse({ 
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async logout({ auth, response, i18n }: HttpContext) {
    try {
      await auth.use('web').logout()
      return {
        message: i18n.t('sessions.logout.success')
      }
    } catch (error) {
      return response.status(500).json({
        message: i18n.t('sessions.logout.error')
      })
    }
  }

  /**
   * Check authentication status
   */
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({ 
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        isAuthenticated: { type: 'boolean' },
        user: { type: 'object' }
      }
    }
  })
  async me({ auth, response, i18n }: HttpContext) {
    try {
      const user = auth.use('web').user
      
      if (!user) {
        return response.status(401).json({
          message: i18n.t('sessions.check.not_authenticated'),
          isAuthenticated: false
        })
      }
      
      return {
        message: i18n.t('sessions.check.user_authenticated'),
        isAuthenticated: true,
        user: user.serialize()
      }
    } catch (error) {
      return response.status(401).json({
        message: i18n.t('sessions.check.not_authenticated'),
        isAuthenticated: false
      })
    }
  }

  /**
   * Refresh user session (optional endpoint for future use)
   */
  @ApiOperation({ summary: 'Refresh user session' })
  @ApiResponse({ 
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        isAuthenticated: { type: 'boolean' },
        user: { type: 'object' }
      }
    }
  })
  async refresh({ auth, response, i18n }: HttpContext) {
    try {
      const user = auth.use('web').user
      
      if (!user) {
        return response.status(401).json({
          message: i18n.t('sessions.check.not_authenticated'),
          isAuthenticated: false
        })
      }

      // Refresh the session by getting fresh user data
      await user.refresh()
      
      return {
        message: 'Session refreshed successfully',
        isAuthenticated: true,
        user: user.serialize()
      }
    } catch (error) {
      return response.status(401).json({
        message: i18n.t('sessions.check.not_authenticated'),
        isAuthenticated: false
      })
    }
  }
} 