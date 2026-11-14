// Express app: middleware + routes + error handling (exported for tests)
import express from 'express'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import config from '../config/config.js'
import sanitize from './helpers/sanitize.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import incidentRoutes from './routes/incident.routes.js'

const app = express()

// Parse JSON / form bodies (max 10 kb), cookies, block NoSQL injection,
// compress responses, set secure headers, allow the React client (CORS)
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())
app.use(sanitize)
app.use(compress())
app.use(helmet())
app.use(cors({ origin: config.clientUrl, credentials: true }))

// Health check / welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the ResolveIT Incident Management API' })
})

// Mount routes
app.use('/', authRoutes)
app.use('/', userRoutes)
app.use('/', incidentRoutes)

// Unknown route
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` })
})

// Error handler: invalid or missing JWT -> 401, anything else -> 500
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: err.name + ': ' + err.message })
  }
  console.error(err)
  return res.status(500).json({ error: 'Internal server error' })
})

export default app
