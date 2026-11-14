// Stores the JWT and user after sign-in (same idea as the course mern_skeleton
// auth-helper). sessionStorage clears when the browser tab closes.
const KEY = 'jwt'

const auth = {
  authenticate (data, cb) {
    sessionStorage.setItem(KEY, JSON.stringify(data))
    if (cb) cb()
  },
  isAuthenticated () {
    const stored = sessionStorage.getItem(KEY)
    return stored ? JSON.parse(stored) : false
  },
  clearJWT (cb) {
    sessionStorage.removeItem(KEY)
    if (cb) cb()
  }
}

export default auth
