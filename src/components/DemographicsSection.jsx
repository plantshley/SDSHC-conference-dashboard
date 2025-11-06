import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AttendeeSegmentationMatrix from './AttendeeSegmentationMatrix'

const COLORS = ['#90CAF9', '#BA68C8', '#F48FB1', '#9FA8DA', '#CE93D8', '#FF80AB', '#81D4FA']

export default function DemographicsSection({ surveyData }) {
  // Process attendee type data
  const attendeeTypeCounts = {}
  surveyData.forEach(row => {
    if (row.Attendee_Type_Category) {
      attendeeTypeCounts[row.Attendee_Type_Category] = (attendeeTypeCounts[row.Attendee_Type_Category] || 0) + 1
    }
  })

  const attendeeTypeData = Object.entries(attendeeTypeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Attendee type by year
  const yearTypeData = {}
  surveyData.forEach(row => {
    if (row.year && row.Attendee_Type_Category) {
      if (!yearTypeData[row.year]) {
        yearTypeData[row.year] = {}
      }
      yearTypeData[row.year][row.Attendee_Type_Category] = (yearTypeData[row.year][row.Attendee_Type_Category] || 0) + 1
    }
  })

  const attendeeByYearData = Object.keys(yearTypeData).sort().map(year => {
    const data = { year }
    Object.keys(attendeeTypeCounts).forEach(type => {
      data[type] = yearTypeData[year][type] || 0
    })
    return data
  })

  // Attendee type trends
  const trendData = Object.keys(yearTypeData).sort().map(year => ({
    year,
    ...yearTypeData[year]
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.type || payload[0].payload.year}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <section>
      <h2>Attendee Demographics & Reach</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Attendee Type Distribution */}
        <div className="chart-section">
          <h3>Attendee Type Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={attendeeTypeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => `${entry.type}: ${entry.count}`}
              >
                {attendeeTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Attendee Type by Year */}
        <div className="chart-section">
          <h3>Attendee Type by Year</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={attendeeByYearData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                style={{ fontSize: '11px' }}
              />
              <YAxis
                label={{ value: 'Number of Attendees', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              {Object.keys(attendeeTypeCounts).map((type, index) => (
                <Bar key={type} dataKey={type} stackId="a" fill={COLORS[index % COLORS.length]} name={type} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendee Type Trends */}
      <div className="chart-section">
        <h3>Attendee Type Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              style={{ fontSize: '11px' }}
            />
            <YAxis
              label={{ value: 'Number of Attendees', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              style={{ fontSize: '11px' }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
            {Object.keys(attendeeTypeCounts).map((type, index) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                name={type}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <AttendeeSegmentationMatrix surveyData={surveyData} />

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
              content: '✓',
              position: 'absolute',
              left: 0,
              color: '#42A5F5',
              fontWeight: 'bold',
              fontSize: '20px',
              width: '24px',
              height: '24px',
              background: 'white',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>✓</span>
            <strong style={{ color: '#1976D2' }}>Diverse Reach:</strong> Agricultural Producers (45.5%) and Conservation Professionals (29.5%) dominate, but diverse audience includes tribal land managers, biologists, students, and commercial operations
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{
              content: '✓',
              position: 'absolute',
              left: 0,
              color: '#42A5F5',
              fontWeight: 'bold',
              fontSize: '20px',
              width: '24px',
              height: '24px',
              background: 'white',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>✓</span>
            <strong style={{ color: '#1976D2' }}>Growing Student Engagement:</strong> Large increase in Students & Educators in 2025 (17.4% vs 3.6% in 2022)
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{
              content: '✓',
              position: 'absolute',
              left: 0,
              color: '#42A5F5',
              fontWeight: 'bold',
              fontSize: '20px',
              width: '24px',
              height: '24px',
              background: 'white',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>✓</span>
            <strong style={{ color: '#1976D2' }}>Knowledge Correlation:</strong> Attendee type strongly correlates with knowledge gained - land managers/owners gain more knowledge than technical professionals
          </li>
        </ul>
      </div>
    </section>
  )
}
