/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import openapi from '@foadonis/openapi/services/main'

import UsersController from '#controllers/users_controller'
import AuthenticationController from '#controllers/authentication_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  // User management routes
  router.get('/users', [UsersController, 'index'])
  router.post('/users', [UsersController, 'create'])
  
  // Authentication routes
  router.post('/auth/login', [AuthenticationController, 'login'])
  router.post('/auth/logout', [AuthenticationController, 'logout'])
  router.get('/auth/me', [AuthenticationController, 'me'])
  router.post('/auth/refresh', [AuthenticationController, 'refresh'])
}).prefix('api/v1')

openapi.registerRoutes("/docs")

