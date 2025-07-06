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
import SessionsController from '#controllers/sessions_controller'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})


router.group(() => {
  router.get('/users', [UsersController, 'index'])
  router.post('/users', [UsersController, 'create'])
  
  // Authentication routes
  router.post('/sessions', [SessionsController, 'login'])
  router.delete('/sessions', [SessionsController, 'logout'])
  router.get('/sessions', [SessionsController, 'check'])
}).prefix('api/v1')

openapi.registerRoutes("/docs")

