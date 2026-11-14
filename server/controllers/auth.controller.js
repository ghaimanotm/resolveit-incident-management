// CONTROLLER: Authentication and Authorization
//  - signin / signout       -> authentication (who are you?)
//  - requireSignin          -> rejects requests without a valid JWT
//  - hasAuthorization       -> user may only change their own account (or admin)
//  - isAdmin                -> admin-only routes
import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import User from '../models/user.model.js'
import config from '../../config/config.js'

const signin = async (req, res) => {
  try {
    const { email, password } = req.body
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) return res.status(401).json({ error: 'User not found' })
    if (!user.authenticate(password)) {
      return res.status(401).json({ error: "Email and password don't match." })
    }

    // The token carries the user's id and role
    const token = jwt.sign({ _id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    })
    res.cookie('t', token, { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 })

    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    return res.status(400).json({ error: 'Could not sign in' })
  }
}

const signout = (req, res) => {
  res.clearCookie('t')
  return res.status(200).json({ message: 'Signed out' })
}

// Reads "Authorization: Bearer <token>" (or the 't' cookie) and puts the
// decoded token in req.auth. Invalid/missing token -> 401 (see express.js).
const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  requestProperty: 'auth',
  getToken: (req) => {
    const header = req.headers.authorization
    if (header && header.split(' ')[0] === 'Bearer') return header.split(' ')[1]
    if (req.cookies && req.cookies.t) return req.cookies.t
    return null
  }
})

// The signed-in user may only act on their own profile, unless they are an admin
const hasAuthorization = (req, res, next) => {
  const isOwner = req.profile && req.auth && String(req.profile._id) === String(req.auth._id)
  const isAdminUser = req.auth && req.auth.role === 'admin'
  if (!(isOwner || isAdminUser)) {
    return res.status(403).json({ error: 'User is not authorized' })
  }
  next()
}

const isAdmin = (req, res, next) => {
  if (!req.auth || req.auth.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

export default { signin, signout, requireSignin, hasAuthorization, isAdmin }
