// Admin page: list of all users (GET /api/users is admin-only on the server)
import { useEffect, useState } from 'react'
import { listUsers } from '../api/api.js'
import Badge from '../components/Badge.jsx'

export default function Users () {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    listUsers().then(setUsers).catch((err) => setError(err.message))
  }, [])

  return (
    <section className="card">
      <h1>Users</h1>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Joined</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td><Badge value={u.role} /></td><td>{new Date(u.created).toLocaleDateString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
