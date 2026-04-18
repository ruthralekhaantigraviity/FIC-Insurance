export default function StatCard({ title, value, variant = 'primary' }) {
  return (
    <div className={`stat-card ${variant}`}>
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  )
}
