// Home / Landing page: site name, logo, purpose, and (when signed in)
// the user's most recent incidents.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { listIncidents } from '../api/api.js'
import Badge from '../components/Badge.jsx'

export default function Home () {
  const { session } = useAuth()
  const [recent, setRecent] = useState([])

  useEffect(() => {
    if (!session) return
    listIncidents().then((data) => setRecent(data.slice(0, 3))).catch(() => setRecent([]))
  }, [session])

  return (
    <section className="home">
      <div className="hero">
        <img src="/logo.svg" alt="" className="hero-logo" />
        <h1>Report it. Track it. Resolve it.</h1>
        <p>ResolveIT helps your organisation log IT, facilities and safety incidents in one place, so nothing gets lost and everyone can see progress.</p>
        {!session
          ? <div className="actions"><Link className="btn" to="/signup">Get started</Link><Link className="btn btn-outline" to="/signin">Sign in</Link></div>
          : <div className="actions"><Link className="btn" to="/incidents/new">Report an incident</Link><Link className="btn btn-outline" to="/incidents">View incidents</Link></div>}
      </div>

      {session && (
        <div className="card">
          <h2>Welcome back, {session.user.name}</h2>
          {recent.length === 0
            ? <p>No incidents yet. <Link to="/incidents/new">Report your first one.</Link></p>
            : (
              <ul className="recent">
                {recent.map((i) => (
                  <li key={i._id}><Link to={`/incidents/${i._id}/edit`}>{i.title}</Link> <Badge value={i.priority} /> <Badge value={i.status} /></li>
                ))}
              </ul>
              )}
        </div>
      )}
    </section>
  )
}
