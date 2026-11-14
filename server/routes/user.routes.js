// ROUTES: User CRUD
//   POST   /api/users            sign up (public)
//   GET    /api/users            list all users (admin)
//   GET    /api/users/:userId    read one (signed in)
//   PUT    /api/users/:userId    update (owner or admin)
//   DELETE /api/users/:userId    delete (owner or admin)
import express from 'express'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/api/users')
  .post(userCtrl.create)
  .get(authCtrl.requireSignin, authCtrl.isAdmin, userCtrl.list)

router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userCtrl.read)
  .put(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)

router.param('userId', userCtrl.userByID)

export default router
