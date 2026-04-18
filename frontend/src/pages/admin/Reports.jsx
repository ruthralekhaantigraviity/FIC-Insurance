import { useEffect, useState } from 'react'
import api from '../../services/api.js'

export default function Reports() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setReport(res.data)).catch(console.error)
  }, [])

  const handleExport = () => {
    window.open('/api/reports/export/leads', '_blank')
  }

  return (
    <div className="page-grid">
      <div className="section-header">
        <h2>Reports</h2>
        <p>Export daily leads and review call center performance metrics.</p>
      </div>
      <section className="card">
        <button className="btn-primary" onClick={handleExport}>Export Leads to Excel</button>
      </section>
      <section className="card">
        <h3>Live summary</h3>
        {report ? (
          <div className="stats-grid">
            <div className="stat-card"><span>Daily Calls</span><strong>{report.calledLeads}</strong></div>
            <div className="stat-card"><span>Leads Converted</span><strong>{report.interestedLeads}</strong></div>
            <div className="stat-card"><span>Payments Collected</span><strong>{report.paymentsCompleted}</strong></div>
            <div className="stat-card"><span>Incentives Earned</span><strong>₹{report.totalIncentives}</strong></div>
          </div>
        ) : (
          <p>Loading report data...</p>
        )}
      </section>
    </div>
  )
}
