// Central configuration. Values come from the .env file (never commit .env).
import dotenv from 'dotenv'

dotenv.config({ quiet: true })

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret_in_env',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resolveit',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
}

export default config
