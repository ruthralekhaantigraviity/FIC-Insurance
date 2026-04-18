import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import StatCard from '../../components/cards/StatCard.jsx'

export default function EmployeeDashboard() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setMetrics(res.data)).catch(console.error)
  }, [])

  return (
    <div className="page-grid">
      <div className="section-header">
        <h2>Employee Dashboard</h2>
        <p>Quick access to assigned leads, daily activity, and incentive performance.</p>
      </div>
      <div className="stats-grid">
        {metrics ? (
          [
            { title: 'Called Leads', value: metrics.calledLeads },
            { title: 'Interested Leads', value: metrics.interestedLeads },
            { title: 'Payments Completed', value: metrics.paymentsCompleted },
            { title: 'OD Conversions', value: metrics.odCount },
            { title: 'Third Party Conversions', value: metrics.thirdPartyCount },
            { title: 'Incentives Earned', value: `₹${metrics.totalIncentives}` },
          ].map((stat) => <StatCard key={stat.title} title={stat.title} value={stat.value} />)
        ) : (
          <p>Loading metrics...</p>
        )}
      </div>
      <section className="card">
        <h3>Quick Actions</h3>
        <div className="action-grid">
          <div className="action-card">View assigned leads</div>
          <div className="action-card">Update customer status</div>
          <div className="action-card">Send payment links</div>
          <div className="action-card">Review announcements</div>
        </div>
      </section>
    </div>
  )
}
