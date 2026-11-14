// All calls from React to the Express API go through this file.
// The JWT from sign-in is sent as "Authorization: Bearer <token>".
import auth from '../auth/auth-helper.js'

const BASE = import.meta.env.VITE_API_URL || ''

async function request (path, { method = 'GET', body } = {}) {
  const session = auth.isAuthenticated()
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (session && session.token) headers.Authorization = `Bearer ${session.token}`

  const res = await fetch(BASE + path, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

// Auth
export const signin = (credentials) => request('/auth/signin', { method: 'POST', body: credentials })
export const signout = () => request('/auth/signout')

// Users
export const createUser = (user) => request('/api/users', { method: 'POST', body: user })
export const listUsers = () => request('/api/users')
export const readUser = (id) => request(`/api/users/${id}`)
export const updateUser = (id, user) => request(`/api/users/${id}`, { method: 'PUT', body: user })
export const removeUser = (id) => request(`/api/users/${id}`, { method: 'DELETE' })

// Incidents
export const listIncidents = (filters = {}) => {
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString()
  return request('/api/incidents' + (qs ? `?${qs}` : ''))
}
export const createIncident = (incident) => request('/api/incidents', { method: 'POST', body: incident })
export const readIncident = (id) => request(`/api/incidents/${id}`)
export const updateIncident = (id, incident) => request(`/api/incidents/${id}`, { method: 'PUT', body: incident })
export const removeIncident = (id) => request(`/api/incidents/${id}`, { method: 'DELETE' })
