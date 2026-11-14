// Incident dashboard (READ + DELETE): lists incidents with filters.
// Normal users see their own incidents; admins see every incident.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listIncidents, removeIncident } from '../api/api.js'
import { useAuth } from '../auth/AuthContext.jsx'
import Badge from '../components/Badge.jsx'

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const CATEGORIES = ['IT', 'Facilities', 'Security', 'Health & Safety', 'Other']

export default function Incidents () {
  const { session } = useAuth()
  const isAdmin = session.user.role === 'admin'
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' })
  const [incidents, setIncidents] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listIncidents(filters)
      .then(setIncidents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [filters])

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value })

  const handleDelete = async (incident) => {
    if (!window.confirm(`Delete "${incident.title}"?`)) return
    try {
      await removeIncident(incident._id)
      setIncidents(incidents.filter((i) => i._id !== incident._id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="card">
      <div className="row-between">
        <h1>{isAdmin ? 'All Incidents' : 'My Incidents'}</h1>
        <Link className="btn" to="/incidents/new">+ Report incident</Link>
      </div>

      <div className="filters" role="group" aria-label="Filter incidents">
        <FilterSelect name="status" label="Status" options={STATUSES} value={filters.status} onChange={handleFilter} />
        <FilterSelect name="priority" label="Priority" options={PRIORITIES} value={filters.priority} onChange={handleFilter} />
        <FilterSelect name="category" label="Category" options={CATEGORIES} value={filters.category} onChange={handleFilter} />
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {loading
        ? <p>Loading…</p>
        : incidents.length === 0
          ? <p>No incidents found.</p>
          : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th scope="col">Title</th><th scope="col">Category</th><th scope="col">Priority</th><th scope="col">Status</th>{isAdmin && <th scope="col">Reported by</th>}<th scope="col">Actions</th></tr>
                </thead>
                <tbody>
                  {incidents.map((i) => (
                    <tr key={i._id}>
                      <td>{i.title}</td>
                      <td>{i.category}</td>
                      <td><Badge value={i.priority} /></td>
                      <td><Badge value={i.status} /></td>
                      {isAdmin && <td>{i.reportedBy && i.reportedBy.name}</td>}
                      <td className="actions-cell">
                        <Link to={`/incidents/${i._id}/edit`}>Edit</Link>
                        <button type="button" className="link danger" onClick={() => handleDelete(i)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
    </section>
  )
}

// Reusable filter dropdown (props: name, label, options, value, onChange)
function FilterSelect ({ name, label, options, value, onChange }) {
  return (
    <label>
      {label}
      <select name={name} value={value} onChange={onChange}>
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
