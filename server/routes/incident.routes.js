// ROUTES: Incident CRUD (all require a signed-in user)
//   POST   /api/incidents                create
//   GET    /api/incidents                list (own incidents, or all for admin)
//   GET    /api/incidents/:incidentId    read one   (reporter or admin)
//   PUT    /api/incidents/:incidentId    update     (reporter or admin)
//   DELETE /api/incidents/:incidentId    delete     (reporter or admin)
import express from 'express'
import incidentCtrl from '../controllers/incident.controller.js'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/api/incidents')
  .post(authCtrl.requireSignin, incidentCtrl.create)
  .get(authCtrl.requireSignin, incidentCtrl.list)

router.route('/api/incidents/:incidentId')
  .get(authCtrl.requireSignin, incidentCtrl.canAccess, incidentCtrl.read)
  .put(authCtrl.requireSignin, incidentCtrl.canAccess, incidentCtrl.update)
  .delete(authCtrl.requireSignin, incidentCtrl.canAccess, incidentCtrl.remove)

router.param('incidentId', incidentCtrl.incidentByID)

export default router
