import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api.js'

export default function Leads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leads').then((res) => setLeads(res.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-grid">
      <div className="section-header">
        <h2>Leads</h2>
        <p>Review and update the lead pipeline for conversion and follow-up.</p>
      </div>
      <section className="card">
        {loading ? (
          <p>Loading leads...</p>
        ) : (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.phone}</td>
                    <td>{lead.status.replace('_', ' ')}</td>
                    <td>{lead.assignedTo?.name || 'Unassigned'}</td>
                    <td><Link to={`/leads/${lead._id}`} className="link-button">Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
