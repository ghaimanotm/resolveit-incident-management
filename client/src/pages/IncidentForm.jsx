// One form for CREATE and UPDATE. With an :incidentId in the URL it loads
// the incident and saves with PUT; otherwise it creates with POST.
// Admins also see the workflow fields (status, resolution notes).
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createIncident, readIncident, updateIncident } from '../api/api.js'
import { useAuth } from '../auth/AuthContext.jsx'

const EMPTY = { title: '', description: '', category: 'IT', priority: 'Medium', location: '', status: 'Open', resolutionNotes: '' }

export default function IncidentForm () {
  const { incidentId } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const isAdmin = session.user.role === 'admin'
  const [values, setValues] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!incidentId) return
    readIncident(incidentId)
      .then((i) => setValues({ ...EMPTY, ...i, location: i.location || '', resolutionNotes: i.resolutionNotes || '' }))
      .catch((err) => setError(err.message))
  }, [incidentId])

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { title, description, category, priority, location, status, resolutionNotes } = values
    const body = { title, description, category, priority, location }
    if (incidentId && isAdmin) Object.assign(body, { status, resolutionNotes })
    try {
      if (incidentId) await updateIncident(incidentId, body)
      else await createIncident(body)
      navigate('/incidents')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="card form-card wide">
      <h1>{incidentId ? 'Edit incident' : 'Report an incident'}</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" value={values.title} onChange={handleChange} required maxLength={120} />
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={4} value={values.description} onChange={handleChange} required />
        <div className="two-col">
          <div>
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={values.category} onChange={handleChange}>
              {['IT', 'Facilities', 'Security', 'Health & Safety', 'Other'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={values.priority} onChange={handleChange}>
              {['Low', 'Medium', 'High', 'Critical'].map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <label htmlFor="location">Location</label>
        <input id="location" name="location" value={values.location} onChange={handleChange} placeholder="e.g. Building A, floor 3" />

        {incidentId && isAdmin && (
          <fieldset>
            <legend>Admin: workflow</legend>
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={values.status} onChange={handleChange}>
              {['Open', 'In Progress', 'Resolved', 'Closed'].map((s) => <option key={s}>{s}</option>)}
            </select>
            <label htmlFor="resolutionNotes">Resolution notes</label>
            <textarea id="resolutionNotes" name="resolutionNotes" rows={2} value={values.resolutionNotes} onChange={handleChange} />
          </fieldset>
        )}

        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button className="btn" type="submit">Save</button>
          <button className="btn btn-outline" type="button" onClick={() => navigate('/incidents')}>Cancel</button>
        </div>
      </form>
    </section>
  )
}
