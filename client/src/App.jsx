// Routes for the whole app (React Router). Pages that need sign-in are
// wrapped in PrivateRoute.
import { Route, Routes } from 'react-router-dom'
import Menu from './components/Menu.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import Signin from './pages/Signin.jsx'
import Incidents from './pages/Incidents.jsx'
import IncidentForm from './pages/IncidentForm.jsx'
import Profile from './pages/Profile.jsx'
import Users from './pages/Users.jsx'

export default function App () {
  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Menu />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/incidents" element={<PrivateRoute><Incidents /></PrivateRoute>} />
          <Route path="/incidents/new" element={<PrivateRoute><IncidentForm /></PrivateRoute>} />
          <Route path="/incidents/:incidentId/edit" element={<PrivateRoute><IncidentForm /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute adminOnly><Users /></PrivateRoute>} />
          <Route path="*" element={<section className="card"><h1>Page not found</h1></section>} />
        </Routes>
      </main>
      <footer>© 2026 Team ResolveIT · COMP229 Web Application Development</footer>
    </>
  )
}
