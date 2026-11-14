// Sign Up page: a controlled form (useState) that calls POST /api/users
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUser } from '../api/api.js'

export default function Signup () {
  const navigate = useNavigate()
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setValues({ ...values, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await createUser(values)
      navigate('/signin', { state: { message: 'Account created. Please sign in.' } })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="card form-card">
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" value={values.name} onChange={handleChange} required autoComplete="name" />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} required autoComplete="email" />
        <label htmlFor="password">Password <small>(at least 6 characters)</small></label>
        <input id="password" name="password" type="password" value={values.password} onChange={handleChange} required minLength={6} autoComplete="new-password" />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" type="submit">Sign Up</button>
      </form>
      <p>Already registered? <Link to="/signin">Sign in</Link></p>
    </section>
  )
}
