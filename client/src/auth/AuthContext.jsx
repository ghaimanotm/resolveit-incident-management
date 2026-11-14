// Shares the signed-in user with every component through React Context.
// When the user signs in or out, every component that uses useAuth()
// re-renders (menu, home page, protected routes...).
import { createContext, useContext, useState } from 'react'
import auth from './auth-helper.js'

const AuthContext = createContext(null)

export function AuthProvider ({ children }) {
  const [session, setSession] = useState(auth.isAuthenticated())

  const login = (data) => auth.authenticate(data, () => setSession(data))
  const logout = () => auth.clearJWT(() => setSession(false))
  const updateUser = (user) => {
    const next = { ...session, user: { ...session.user, ...user } }
    auth.authenticate(next, () => setSession(next))
  }

  return (
    <AuthContext.Provider value={{ session, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
