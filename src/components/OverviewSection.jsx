import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function OverviewSection({ surveyData }) {
  // Prepare attendance data
  const attendanceData = [
    { year: '2022', registrations: 251, responses: 0 },
    { year: '2023', registrations: 254, responses: 102 },
    { year: '2024', registrations: 307, responses: 149 },
    { year: '2025', registrations: 391, responses: 68 }
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.year}</strong></p>
          <p style={{ color: '#42A5F5' }}>Registrations: {data.registrations}</p>
          <p style={{ color: '#EC407A' }}>Survey Responses: {data.responses}</p>
        </div>
      )
    }
    return null
  }

  return (
    <section>
      <h2>4-Year Conference Journey</h2>

      <div className="chart-section">
        <h3>Conference Attendance Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={attendanceData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              style={{ fontSize: '11px' }}
            />
            <YAxis
              label={{ value: 'Number of People', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              style={{ fontSize: '11px' }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ fontSize: '13px', fontWeight: 600, color: '#333' }}
            />
            <Line
              type="monotone"
              dataKey="registrations"
              stroke="#90CAF9"
              strokeWidth={2}
              name="Ticket Registrations"
              dot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="responses"
              stroke="#F48FB1"
              strokeWidth={2}
              name="Survey Responses"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="insights-box" style={{
        background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
        color: '#333',
        padding: '32px',
        borderRadius: '12px',
        marginTop: '32px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        borderLeft: '6px solid #42A5F5'
      }}>
        <h3 style={{ color: '#1976D2', marginBottom: '20px' }}>Key Insights</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: 0,
              fontSize: '22px'
            }}>📈</span>
            <strong style={{ color: '#1976D2' }}>Exceptional Growth:</strong> Ticket registrations increased 56% from 251 (2022) to 391 (2025) - total 1,307+ attendees over 4 years
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🌍</span>
            <strong style={{ color: '#1976D2' }}>International Reach:</strong> Attendees from over 260 communities, 48 states & provinces, and 14 countries – from local South Dakota to Morocco, Greece, India, and Fiji
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>⭐</span>
            <strong style={{ color: '#1976D2' }}>Conference Satisfaction:</strong> 91% rated 4-5 stars across all years
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🌱</span>
            <strong style={{ color: '#1976D2' }}>Impact:</strong> 87% likely to change practices/implement new knowledge
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>👥</span>
            <strong style={{ color: '#1976D2' }}>Diverse Reach:</strong> From tribal land managers to commercial operations
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>💡</span>
            <strong style={{ color: '#1976D2' }}>Topics of Interest:</strong> Nutrient management, health connections, & regenerative ag topics trending up
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🔧</span>
            <strong style={{ color: '#1976D2' }}>Technician Assistance Interest:</strong> 48% respondents interested in technician program
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🔗</span>
            <strong style={{ color: '#1976D2' }}>Strong Correlations:</strong> Knowledge gained, conference satisfaction, technician assistance interest, and likelihood to implement changes are all very strongly correlated
          </li>
        </ul>
      </div>
    </section>
  )
}
