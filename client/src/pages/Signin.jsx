// Sign In page: calls POST /auth/signin, stores the JWT, then redirects
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signin } from '../api/api.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Signin () {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await signin(values)
      login(data)
      const to = (location.state && location.state.from && location.state.from.pathname) || '/incidents'
      navigate(to, { replace: true })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="card form-card">
      <h1>Sign In</h1>
      {location.state && location.state.message && <p className="success" role="status">{location.state.message}</p>}
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} required autoComplete="email" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={values.password} onChange={handleChange} required autoComplete="current-password" />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" type="submit">Sign In</button>
      </form>
      <p>No account? <Link to="/signup">Sign up</Link></p>
    </section>
  )
}
