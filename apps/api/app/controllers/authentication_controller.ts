import type { HttpContext } from '@adonisjs/core/http'
import { ApiOperation, ApiBody, ApiResponse } from '@foadonis/openapi/decorators'
import { errors } from '@adonisjs/auth'
import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'

import User from '#models/user'
import { loginValidator, createUserValidator } from '#validators/user'

export default class AuthenticationController {
  /**
   * Register a new user
   */
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: () => createUserValidator })
  @ApiResponse({ type: User })
  async register({ request, auth, i18n }: HttpContext) {
    const { fullName, email, password } = await request.validateUsing(createUserValidator)

    logger.info({
      email: email.toLowerCase(),
      fullName,
    }, 'Registration attempt started')

    try {
      // Check if user already exists
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        logger.warn({
          email: email.toLowerCase(),
          existingUserId: existingUser.id,
        }, 'Registration failed - Email already exists')

        throw new errors.E_INVALID_CREDENTIALS(i18n.t('sessions.register.email_already_exists'), { status: 400 })
      }

      // Create new user
      const user = await User.create({
        fullName,
        email,
        password
      })

      logger.info({
        userId: user.id,
        email: user.email.toLowerCase(),
        fullName: user.fullName,
      }, 'User created successfully')

      // Login the newly created user
      await auth.use('web').login(user)

      logger.info({
        userId: user.id,
        email: user.email.toLowerCase(),
      }, 'User automatically logged in after registration')

      await mail.send((message) => {
        message
          .to(user.email)
          .from('info@example.org')
          .subject('Verify your email address')
          .htmlView('emails/verify_email', { user })
      })

      return {
        message: i18n.t('sessions.register.success'),
        user: user.serialize()
      }
    } catch (error) {
      // If it's already an auth error, re-throw it
      if (error instanceof errors.E_INVALID_CREDENTIALS) {
        logger.error({
          email: email.toLowerCase(),
          error: error.message,
          status: error.status,
        }, 'Registration failed with auth error')
        throw error
      }

      // For other errors (like validation), throw a generic registration error
      logger.error({
        email: email.toLowerCase(),
        error: error.message,
        stack: error.stack,
      }, 'Registration failed with unexpected error')

      throw new errors.E_INVALID_CREDENTIALS(i18n.t('sessions.register.failed'), { status: 400 })
    }
  }

  /**
   * Authenticate a user (login)
   */
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiBody({ type: () => loginValidator })
  @ApiResponse({ type: User })
  async login({ request, auth, i18n }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    logger.info({
      email: email.toLowerCase(),
    }, 'Login attempt started')

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      logger.info({
        userId: user.id,
        email: user.email.toLowerCase(),
        fullName: user.fullName,
      }, 'Login successful')

      return {
        message: i18n.t('sessions.login.success'),
        user: user.serialize()
      }
    } catch (error) {
      logger.warn({
        email: email.toLowerCase(),
        error: error.message,
      }, 'Login failed - Invalid credentials')

      // Throw proper AdonisJS auth exception that Tuyau can handle
      throw new errors.E_INVALID_CREDENTIALS(i18n.t('sessions.login.invalid_credentials'), { status: 400 })
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
  async logout({ auth, i18n }: HttpContext) {
    const user = auth.use('web').user

    if (user) {
      logger.info({
        userId: user.id,
        email: user.email.toLowerCase(),
      }, 'Logout initiated')
    }

    await auth.use('web').logout()

    logger.info({
      userId: user?.id || 'unknown',
    }, 'Logout completed successfully')

    return {
      message: i18n.t('sessions.logout.success')
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
  async me({ auth, i18n }: HttpContext) {
    const user = auth.use('web').user

    if (!user) {
      logger.info({
      }, 'Authentication check failed - User not authenticated')

      // Throw proper AdonisJS auth exception for unauthorized access
      throw new errors.E_UNAUTHORIZED_ACCESS(i18n.t('sessions.check.not_authenticated'), { guardDriverName: 'web' })
    }

    logger.info({
      userId: user.id,
      email: user.email.toLowerCase(),
    }, 'Authentication check successful')

    return {
      message: i18n.t('sessions.check.user_authenticated'),
      isAuthenticated: true,
      user: user.serialize()
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
  async refresh({ auth, i18n }: HttpContext) {
    const user = auth.use('web').user

    if (!user) {
      logger.warn('Session refresh failed - User not authenticated')

      // Throw proper AdonisJS auth exception for unauthorized access
      throw new errors.E_UNAUTHORIZED_ACCESS(i18n.t('sessions.check.not_authenticated'), { guardDriverName: 'web' })
    }

    logger.info({
      userId: user.id,
      email: user.email.toLowerCase(),
    }, 'Session refresh initiated')

    // Refresh the session by getting fresh user data
    await user.refresh()

    logger.info({
      userId: user.id,
      email: user.email.toLowerCase(),
    }, 'Session refresh completed successfully')

    return {
      message: i18n.t('sessions.refresh.success'),
      isAuthenticated: true,
      user: user.serialize()
    }
  }
} 