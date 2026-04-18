import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import { toast } from 'react-toastify'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get('/tasks').then((res) => setTasks(res.data)).catch(console.error)
    api.get('/users').then((res) => setUsers(res.data)).catch(() => {})
  }, [])

  const createTask = async () => {
    if (!title || !assignee) return toast.warn('Add title and assignee')
    await api.post('/tasks', { title, assignedTo: assignee })
    toast.success('Task created')
    setTitle('')
    setAssignee('')
    const response = await api.get('/tasks')
    setTasks(response.data)
  }

  return (
    <div className="page-grid">
      <div className="section-header">
        <h2>Tasks</h2>
        <p>Create call plans, follow-up activities, and status updates.</p>
      </div>
      <section className="card">
        <div className="task-form-grid">
          <label>
            Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Assign to
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">Choose user</option>
              {users.map((user) => (<option key={user._id} value={user._id}>{user.name}</option>))}
            </select>
          </label>
          <button className="btn-primary" onClick={createTask}>Create task</button>
        </div>
      </section>
      <section className="card">
        <h3>Active tasks</h3>
        <div className="table-card">
          <table>
            <thead>
              <tr><th>Title</th><th>Assignee</th><th>Status</th></tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{task.assignedTo?.name || 'Unknown'}</td>
                  <td>{task.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
