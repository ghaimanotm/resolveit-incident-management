// My Profile (READ + UPDATE + DELETE for the user object)
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { readUser, removeUser, updateUser } from '../api/api.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Profile () {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { logout, updateUser: updateSessionUser } = useAuth()
  const [user, setUser] = useState(null)
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    readUser(userId)
      .then((u) => { setUser(u); setValues({ name: u.name, email: u.email, password: '' }) })
      .catch((err) => setError(err.message))
  }, [userId])

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    const body = { name: values.name, email: values.email }
    if (values.password) body.password = values.password
    try {
      const updated = await updateUser(userId, body)
      setUser(updated)
      setValues({ ...values, password: '' })
      // keep the name in the shared session up to date
      updateSessionUser({ name: updated.name, email: updated.email })
      setMessage('Profile updated.')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete your account permanently?')) return
    try {
      await removeUser(userId)
      logout()
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!user) return <section className="card">{error ? <p className="error">{error}</p> : <p>Loading…</p>}</section>

  return (
    <section className="card form-card">
      <h1>My Profile</h1>
      <p className="muted">Role: <strong>{user.role}</strong> · Member since {new Date(user.created).toLocaleDateString()}</p>
      <form onSubmit={handleSave} noValidate>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={values.name} onChange={handleChange} />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} />
        <label htmlFor="password">New password <small>(leave blank to keep the current one)</small></label>
        <input id="password" name="password" type="password" value={values.password} onChange={handleChange} autoComplete="new-password" />
        {message && <p className="success" role="status">{message}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <div className="actions">
          <button className="btn" type="submit">Save changes</button>
          <button className="btn btn-danger" type="button" onClick={handleDelete}>Delete account</button>
        </div>
      </form>
    </section>
  )
}
