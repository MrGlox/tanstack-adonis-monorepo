import type { HttpContext } from '@adonisjs/core/http'
import { ApiOperation, ApiBody, ApiResponse } from '@foadonis/openapi/decorators'

import User from '#models/user'
import { loginValidator } from '#validators/user'

export default class SessionsController {
  /**
   * Login a user
   */
  @ApiOperation({ summary: 'Login a user' })
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
  @ApiResponse({ type: 'object' })
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
   * Check if user is authenticated
   */
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({ type: 'object' })
  async check({ auth, response, i18n }: HttpContext) {
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
} 