// Protects pages that need a signed-in user (and optionally an admin).
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function PrivateRoute ({ children, adminOnly = false }) {
  const location = useLocation()
  const { session } = useAuth()
  if (!session) return <Navigate to="/signin" replace state={{ from: location }} />
  if (adminOnly && session.user.role !== 'admin') return <Navigate to="/incidents" replace />
  return children
}
