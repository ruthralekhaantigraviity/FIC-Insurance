import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api.js'
import { toast } from 'react-toastify'

export default function LeadDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')

  useEffect(() => {
    api.get(`/leads/${id}`).then((res) => {
      setLead(res.data)
      setStatus(res.data.status)
    }).catch(() => navigate('/leads'))
  }, [id, navigate])

  const updateLead = async () => {
    try {
      const body = { status, note }
      await api.put(`/leads/${id}`, body)
      toast.success('Lead updated')
      const res = await api.get(`/leads/${id}`)
      setLead(res.data)
    } catch (error) {
      toast.error('Unable to update lead')
    }
  }

  const sendPaymentLink = async () => {
    try {
      await api.post('/payments/link', { leadId: id, amount: Number(paymentAmount) })
      toast.success('Payment link sent')
      setPaymentAmount('')
    } catch (error) {
      toast.error('Failed to send payment link')
    }
  }

  if (!lead) return <div className="page-grid"><p>Loading lead...</p></div>

  return (
    <div className="page-grid">
      <div className="section-header">
        <h2>{lead.name}</h2>
        <p>{lead.email || 'No email'} · {lead.phone}</p>
      </div>
      <section className="card split-card">
        <div>
          <h3>Lead details</h3>
          <p>Status: <strong>{lead.status.replace('_', ' ')}</strong></p>
          <p>Assigned to: {lead.assignedTo?.name || 'Unassigned'}</p>
          <p>Insurance Type: {lead.insuranceType}</p>
        </div>
        <div>
          <label>
            Update status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {['new','assigned','called','interested','follow_up','not_interested','payment_link_sent','payment_received','processing','issued','closed'].map((item) => (
                <option key={item} value={item}>{item.replace('_', ' ')}</option>
              ))}
            </select>
          </label>
          <label>
            Add note
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows="4" />
          </label>
          <button className="btn-primary" onClick={updateLead}>Save update</button>
        </div>
      </section>
      <section className="card">
        <h3>Follow-up activity</h3>
        <div className="stacked-form">
          <label>
            Payment amount
            <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter amount" />
          </label>
          <button className="btn-secondary" onClick={sendPaymentLink}>Send payment link</button>
        </div>
      </section>
      <section className="card">
        <h3>Notes</h3>
        {lead.notes.length ? (
          <ul className="notes-list">
            {lead.notes.map((item) => (
              <li key={item._id}>{item.text}</li>
            ))}
          </ul>
        ) : (
          <p>No notes yet.</p>
        )}
      </section>
      <section className="card">
        <h3>History</h3>
        <ul className="notes-list">
          {lead.history.map((entry) => (
            <li key={entry._id}>{entry.status.replace('_', ' ')} - {entry.note || 'No comment'}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
