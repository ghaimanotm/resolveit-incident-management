import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During development, requests to /api and /auth are forwarded to the
// Express server on port 3000, so the browser sees one origin (no CORS issues).
const proxy = {
  '/api': 'http://localhost:3000',
  '/auth': 'http://localhost:3000'
}

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy }
})
