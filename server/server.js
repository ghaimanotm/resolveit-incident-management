// Entry point: connects to MongoDB, then starts the Express server
import mongoose from 'mongoose'
import config from '../config/config.js'
import app from './express.js'

mongoose
  .connect(config.mongoUri)
  .then(() => {
    console.log(`Connected to MongoDB: ${config.mongoUri.replace(/\/\/.*@/, '//***@')}`)
    app.listen(config.port, () => {
      console.log(`ResolveIT API running at http://localhost:${config.port}/`)
    })
  })
  .catch((err) => {
    console.error(`Unable to connect to database: ${err.message}`)
    process.exit(1)
  })
