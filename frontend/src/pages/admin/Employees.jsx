import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { toast } from 'react-toastify'

export default function Employees() {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('employee')

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data)).catch(console.error)
  }, [])

  const handleCreate = async () => {
    if (!name || !email) return toast.warn('Name and email are required')
    await api.post('/users', { name, email, role, password: 'Password123' })
    toast.success('Employee added')
    setName('')
    setEmail('')
    const res = await api.get('/users')
    setUsers(res.data)
  }

  return (
    <div className="page-grid">
      <div className="section-header">
        <h2>Employees</h2>
        <p>Manage employee accounts, roles, and team assignments.</p>
      </div>
      <section className="card split-card">
        <div>
          <h3>Create employee</h3>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Employee</option>
              <option value="team_leader">Team Leader</option>
            </select>
          </label>
          <button className="btn-primary" onClick={handleCreate}>Create employee</button>
        </div>
        <div>
          <h3>Employee list</h3>
          <div className="table-card">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
