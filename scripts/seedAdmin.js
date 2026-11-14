// Creates (or resets) the admin account defined in .env:
//   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
// Run once with:  npm run seed
import mongoose from 'mongoose'
import config from '../config/config.js'
import User from '../server/models/user.model.js'

const name = process.env.ADMIN_NAME || 'ResolveIT Admin'
const email = process.env.ADMIN_EMAIL || 'admin@resolveit.com'
const password = process.env.ADMIN_PASSWORD || 'Admin123!'

try {
  await mongoose.connect(config.mongoUri)
  let admin = await User.findOne({ email })
  if (!admin) admin = new User({ name, email })
  admin.password = password
  admin.role = 'admin'
  await admin.save()
  console.log(`Admin ready: ${email}`)
} catch (err) {
  console.error('Seed failed:', err.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
