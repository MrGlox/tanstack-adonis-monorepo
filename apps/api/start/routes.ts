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

const UsersController = () => import('#controllers/users_controller')
const AuthenticationController = () => import('#controllers/authentication_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.resource("users", UsersController)

router.group(() => {
  router.get("/me", [AuthenticationController, "me"])
  router.post("/register", [AuthenticationController, "register"])
  router.post("/login", [AuthenticationController, "login"])
  router.post("/logout", [AuthenticationController, "logout"])
  router.post("/refresh", [AuthenticationController, "refresh"])
}).prefix("auth")

// router.resource("auth", AuthenticationController)

openapi.registerRoutes("/docs")

