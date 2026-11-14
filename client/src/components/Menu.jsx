// Authenticated navigation bar. NavLink adds the "active" class to the link
// for the current page, so users always see where they are.
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { signout } from '../api/api.js'

export default function Menu () {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const isAdmin = session && session.user.role === 'admin'

  const handleSignout = async () => {
    try { await signout() } catch { /* the token is cleared below anyway */ }
    logout()
    navigate('/')
  }

  return (
    <header className="menu">
      <NavLink to="/" className="brand" aria-label="ResolveIT home">
        <img src="/logo.svg" alt="ResolveIT logo" />
      </NavLink>
      <nav aria-label="Main navigation">
        <NavLink to="/" end>Home</NavLink>
        {!session && <NavLink to="/signin">Sign In</NavLink>}
        {!session && <NavLink to="/signup">Sign Up</NavLink>}
        {session && <NavLink to="/incidents" end>{isAdmin ? 'All Incidents' : 'My Incidents'}</NavLink>}
        {session && <NavLink to="/incidents/new">Report Incident</NavLink>}
        {isAdmin && <NavLink to="/users">Users</NavLink>}
        {session && <NavLink to={`/profile/${session.user._id}`}>My Profile</NavLink>}
        {session && <button type="button" className="link" onClick={handleSignout}>Sign Out</button>}
      </nav>
    </header>
  )
}
