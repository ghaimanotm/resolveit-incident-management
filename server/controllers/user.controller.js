// CONTROLLER: User CRUD
import User from '../models/user.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

// CREATE (sign up) - POST /api/users
const create = async (req, res) => {
  try {
    const { name, email, password } = req.body
    // Role is never taken from sign-up: every new account is a normal user
    const user = new User({ name, email, password })
    await user.save()
    return res.status(201).json({ message: 'Successfully signed up!', user })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// READ ALL - GET /api/users (admin only, see routes)
const list = async (req, res) => {
  try {
    const users = await User.find().select('name email role created updated').sort({ created: -1 })
    return res.json(users)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// Loads the user for any route with :userId and stores it in req.profile
const userByID = async (req, res, next, id) => {
  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    req.profile = user
    next()
  } catch (err) {
    return res.status(400).json({ error: 'Could not retrieve user' })
  }
}

// READ ONE - GET /api/users/:userId
const read = (req, res) => res.json(req.profile)

// UPDATE - PUT /api/users/:userId (owner or admin)
const update = async (req, res) => {
  try {
    const user = req.profile
    const { name, email, password, role } = req.body
    if (name !== undefined) user.name = name
    if (email !== undefined) user.email = email
    if (password) user.password = password
    // Only an admin can change roles
    if (role !== undefined) {
      if (req.auth.role !== 'admin') {
        return res.status(403).json({ error: 'Only an admin can change roles' })
      }
      user.role = role
    }
    user.updated = Date.now()
    await user.save()
    return res.json(user)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

// DELETE - DELETE /api/users/:userId (owner or admin)
const remove = async (req, res) => {
  try {
    const deleted = await req.profile.deleteOne()
    return res.json({ message: 'User deleted', user: req.profile })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

export default { create, list, userByID, read, update, remove }
