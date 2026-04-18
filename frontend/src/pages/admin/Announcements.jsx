import { useContext, useEffect, useState } from 'react'
import api from '../../services/api.js'
import { AuthContext } from '../../context/AuthContext.jsx'
import { toast } from 'react-toastify'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get('/announcements').then((res) => setAnnouncements(res.data)).catch(console.error)
  }, [])

  const createAnnouncement = async () => {
    if (!title || !message) return toast.warn('Title and message are required')
    await api.post('/announcements', { title, message })
    toast.success('Announcement posted')
    setTitle('')
    setMessage('')
    const res = await api.get('/announcements')
    setAnnouncements(res.data)
  }

  const { user } = useContext(AuthContext)

  return (
    <div className="page-grid">
      <div className="section-header">
        <h2>Announcements</h2>
        <p>Share news and updates with the sales team instantly.</p>
      </div>
      <section className="card split-card">
        {user?.role === 'admin' ? (
          <div>
            <h3>Post announcement</h3>
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label>
              Message
              <textarea rows="4" value={message} onChange={(e) => setMessage(e.target.value)} />
            </label>
            <button className="btn-primary" onClick={createAnnouncement}>Post announcement</button>
          </div>
        ) : (
          <div>
            <h3>Announcements</h3>
            <p>Read the latest team updates and payment reminders.</p>
          </div>
        )}
        <div>
          <h3>Active announcements</h3>
          {announcements.length ? (
            <ul className="notes-list">
              {announcements.map((item) => (
                <li key={item._id}>
                  <strong>{item.title}</strong>
                  <p>{item.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No announcements yet.</p>
          )}
        </div>
      </section>
    </div>
  )
}
