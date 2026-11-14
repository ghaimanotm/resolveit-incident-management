// MODEL: User
// Stores account details. The plain password is never saved.
// Security best practice: the course mern_skeleton hashes with HMAC-SHA1;
// here it is upgraded to scrypt (a slow, memory-hard password hash built
// into Node's crypto module) with a random 16-byte salt per user.
import mongoose from 'mongoose'
import crypto from 'crypto'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Name is required'
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
    required: 'Email is required'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  hashed_password: {
    type: String,
    required: 'Password is required'
  },
  salt: String,
  created: { type: Date, default: Date.now },
  updated: Date
})

// Virtual field: lets controllers set user.password = '...' and stores only the hash
UserSchema.virtual('password')
  .set(function (password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function () {
    return this._password
  })

// Validate password length when a new password is set
UserSchema.path('hashed_password').validate(function () {
  if (this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters.')
  }
  if (this.isNew && !this._password) {
    this.invalidate('password', 'Password is required')
  }
}, null)

UserSchema.methods = {
  // true when the plain text matches the stored hash.
  // timingSafeEqual compares in constant time, so response timing
  // cannot reveal how much of a guessed password was correct.
  authenticate (plainText) {
    const candidate = Buffer.from(this.encryptPassword(plainText), 'hex')
    const stored = Buffer.from(this.hashed_password || '', 'hex')
    return candidate.length === stored.length && candidate.length > 0 &&
      crypto.timingSafeEqual(candidate, stored)
  },
  encryptPassword (password) {
    if (!password) return ''
    try {
      return crypto.scryptSync(password, this.salt, 64).toString('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt () {
    return crypto.randomBytes(16).toString('hex')
  }
}

// Never send hashed_password or salt back to the client
UserSchema.set('toJSON', {
  transform (doc, ret) {
    delete ret.hashed_password
    delete ret.salt
    delete ret.__v
    return ret
  }
})

export default mongoose.model('User', UserSchema)
