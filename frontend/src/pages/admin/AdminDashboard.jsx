import { useEffect, useState } from 'react'
import api from '../../services/api.js'
import StatCard from '../../components/cards/StatCard.jsx'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    api.get('/reports/dashboard').then((res) => setMetrics(res.data)).catch(console.error)
  }, [])

  return (
    <div className="page-grid">
      <div className="section-header">
        <h2>Admin Dashboard</h2>
        <p>Monitor leads, payments, incentives, and top performers.</p>
      </div>
      <div className="stats-grid">
        {metrics ? (
          [
            { title: 'Total Leads', value: metrics.totalLeads },
            { title: 'Called Leads', value: metrics.calledLeads },
            { title: 'Interested Leads', value: metrics.interestedLeads },
            { title: 'Payment Links Sent', value: metrics.paymentLinksSent },
            { title: 'Payments Completed', value: metrics.paymentsCompleted },
            { title: 'OD Policies', value: metrics.odCount },
            { title: 'Third Party Policies', value: metrics.thirdPartyCount },
            { title: 'Total Incentives', value: `₹${metrics.totalIncentives}` },
          ].map((stat) => <StatCard key={stat.title} title={stat.title} value={stat.value} />)
        ) : (
          <p>Loading metrics...</p>
        )}
      </div>
      <section className="card">
        <h3>Daily Top Performers</h3>
        {metrics?.dailyTopPerformers?.length ? (
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Incentives</th>
                  <th>Conversions</th>
                </tr>
              </thead>
              <tbody>
                {metrics.dailyTopPerformers.map((perf) => (
                  <tr key={perf.email}>
                    <td>{perf.name}</td>
                    <td>{perf.role}</td>
                    <td>₹{perf.incentives}</td>
                    <td>{perf.conversions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No leaderboard data yet.</p>
        )}
      </section>
    </div>
  )
}
