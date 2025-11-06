import './StatsCard.css'

export default function StatsCard({ title, value, subtitle, icon, highlighted = false }) {
  return (
    <div className={`stats-card ${highlighted ? 'highlighted' : ''}`}>
      <div className="stats-card-icon">{icon}</div>
      <div className="stats-card-content">
        <h3 className="stats-card-title">{title}</h3>
        <p className="stats-card-value">{value}</p>
        {subtitle && <p className="stats-card-subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}
