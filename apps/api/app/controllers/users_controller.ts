import type { HttpContext } from '@adonisjs/core/http'
import { ApiOperation, ApiBody, ApiResponse } from '@foadonis/openapi/decorators'

import User from '#models/user'
import { createUserValidator } from '#validators/user'


export default class UsersController {
  @ApiOperation({ summary: 'List all Users' })
  @ApiResponse({ type: [User] })
  async index() {
    const users = await User.all()
    return users.map(user => user.serialize())
  }

  @ApiOperation({ summary: 'Create a new User' })
  @ApiBody({ type: () => createUserValidator })
  @ApiResponse({ type: User })
  async create({ request, response }: HttpContext) {
    try {
      const { fullName, email, password } = await request.validateUsing(createUserValidator)
      
      // Check if user already exists
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        return response.status(409).json({
          message: 'User with this email already exists',
          errors: [{
            field: 'email',
            message: 'This email is already registered'
          }]
        })
      }
      
      // Create new user
      const user = await User.create({
        fullName,
        email,
        password
      })
      
      return response.status(201).json({
        message: 'User created successfully',
        user: user.serialize()
      })
    } catch (error) {
      if (error.messages) {
        return response.status(422).json({
          message: 'Validation failed',
          errors: error.messages
        })
      }
      
      return response.status(500).json({
        message: 'Internal server error'
      })
    }
  }
}