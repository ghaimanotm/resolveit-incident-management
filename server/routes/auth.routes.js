// ROUTES: Authentication
import express from 'express'
import rateLimit from 'express-rate-limit'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

// Brute-force protection: at most SIGNIN_RATE_LIMIT sign-in attempts
// per IP address every 15 minutes (default 10), then 429 Too Many Requests
const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.SIGNIN_RATE_LIMIT) || 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Please try again in 15 minutes.' }
})

router.route('/auth/signin').post(signinLimiter, authCtrl.signin)
router.route('/auth/signout').get(authCtrl.signout)

export default router
