import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import AttendeeSegmentationMatrix from './AttendeeSegmentationMatrix'

const COLOR_PALETTE = ['#87CEEB', '#6A5ACD', '#9370DB', '#BA55D3', '#DA70D6', '#EE82EE', '#FF69B4', '#FF1493', '#FF6347', '#FA8072', '#FFB347', '#F0E68C', '#9ACD32', '#90EE90', '#00FA9A']

// Map attendee types to colors matching the international reach chart legend order
// Belgium pink, Canada blue, Czech purple, Egypt yellow, etc.
const COLOR_MAP = {
  'Agricultural Producers': '#FF69B4',        // Belgium pink (lighter)
  'Conservation Professionals': '#87CEEB',    // Canada blue
  'Industry/Commercial': '#6A5ACD',           // Czech Republic purple
  'Land Managers & Owners': '#F0E68C',        // Egypt yellow
  'Students & Educators': '#DA70D6',          // Ukraine purple
  'Technical Professionals': '#FF6347',       // Greece red
  'Other Professionals': '#FA8072',           // Hong Kong coral
  'Other': '#FFB347',                         // Hungary orange
  'Unknown': '#9370DB'                        // Fiji purple
}

// Helper function to darken a hex color
const darkenColor = (hex, percent = 30) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)))
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

export default function DemographicsSection({ surveyData }) {
  // Custom label component for donut chart
  const renderCustomLabel = (props) => {
    const { cx, cy, midAngle, outerRadius, type, count, totalCount } = props
    const RADIAN = Math.PI / 180
    const radius = outerRadius + 30
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    const percentage = ((count / totalCount) * 100).toFixed(1)

    // Determine text layout based on attendee type
    let lines = []
    if (type === 'Industry/Commercial') {
      lines = ['Industry/', 'Commercial', `(${percentage}%)`]
    } else if (type === 'Land Managers & Owners') {
      lines = ['Land Managers &', 'Owners', `(${percentage}%)`]
    } else if (type === 'Agricultural Producers') {
      lines = ['Agricultural', 'Producers', `(${percentage}%)`]
    } else if (type === 'Conservation Professionals') {
      lines = ['Conservation', 'Professionals', `(${percentage}%)`]
    } else if (type === 'Students & Educators') {
      lines = ['Students &', 'Educators', `(${percentage}%)`]
    } else if (type === 'Technical Professionals') {
      lines = ['Technical', 'Professionals', `(${percentage}%)`]
    } else if (type === 'Other Professionals') {
      lines = ['Other', 'Professionals', `(${percentage}%)`]
    } else {
      // Default: single line with percentage
      lines = [type, `(${percentage}%)`]
    }

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '13px', fontWeight: 600 }}
      >
        {lines.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    )
  }

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

  const totalCount = attendeeTypeData.reduce((sum, item) => sum + item.count, 0)

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
    // Calculate total for this year
    const yearTotal = Object.keys(attendeeTypeCounts).reduce((sum, type) => {
      return sum + (yearTypeData[year][type] || 0)
    }, 0)
    // Convert counts to percentages
    Object.keys(attendeeTypeCounts).forEach(type => {
      const count = yearTypeData[year][type] || 0
      data[type] = yearTotal > 0 ? ((count / yearTotal) * 100) : 0
    })
    return data
  })

  // Attendee type trends - ensure all types have values for each year (0 if missing)
  const trendData = Object.keys(yearTypeData).sort().map(year => {
    const data = { year }
    // Add all attendee types with default value of 0
    Object.keys(attendeeTypeCounts).forEach(type => {
      data[type] = yearTypeData[year][type] || 0
    })
    return data
  })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      // Check if this is the donut chart (has 'type' and 'count' properties)
      if (data.type && data.count !== undefined) {
        const percentage = ((data.count / totalCount) * 100).toFixed(1)
        const color = COLOR_MAP[data.type] || '#333'
        return (
          <div className="custom-tooltip">
            <p className="tooltip-title" style={{ color: darkenColor(color) }}>
              <strong>{data.type}</strong>
            </p>
            <p style={{ color: darkenColor(color), fontWeight: 500 }}>
              Count: {data.count}
            </p>
            <p style={{ color: darkenColor(color), fontWeight: 500 }}>
              Percentage: {percentage}%
            </p>
          </div>
        )
      }

      // For other charts (bar, line, area)
      // Calculate total to determine if we're showing counts or percentages
      const yearTotal = payload.reduce((sum, item) => sum + (item.value || 0), 0)
      // Check if this is percentage data by seeing if total is close to 100
      const isPercentageData = yearTotal >= 99 && yearTotal <= 101

      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.year}</strong></p>
          {payload.map((entry, index) => {
            if (!isPercentageData && typeof entry.value === 'number') {
              // For the trends chart (raw counts), show count and percentage
              const percentage = yearTotal > 0 ? ((entry.value / yearTotal) * 100).toFixed(1) : 0
              return (
                <p key={index} style={{ color: entry.color ? darkenColor(entry.color) : '#333', fontWeight: 500 }}>
                  <span style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    backgroundColor: entry.color || '#ccc',
                    marginRight: '6px',
                    borderRadius: '2px'
                  }}></span>
                  {entry.name}: {entry.value} ({percentage}%)
                </p>
              )
            }

            // For percentage-based charts, just show percentage
            const displayValue = typeof entry.value === 'number' ? `${entry.value.toFixed(1)}%` : entry.value
            return (
              <p key={index} style={{ color: entry.color ? darkenColor(entry.color) : '#333', fontWeight: 500 }}>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: entry.color || '#ccc',
                  marginRight: '6px',
                  borderRadius: '2px'
                }}></span>
                {entry.name}: {displayValue}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  // Custom legend renderer with darker text colors
  const renderLegend = (props) => {
    const { payload } = props
    return (
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        fontSize: '11px',
        fontWeight: 600,
        lineHeight: '1.8'
      }}>
        {payload.map((entry, index) => {
          const darkColor = darkenColor(entry.color)
          return (
            <li key={`item-${index}`} style={{
              marginBottom: '4px',
              color: darkColor,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                borderRadius: '2px'
              }}></span>
              {entry.value}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <section>
      <h2>Attendee Demographics & Reach</h2>
      <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', marginTop: '-12px', marginBottom: '20px' }}>
        Counts and percentages based on survey response data
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Attendee Type Distribution */}
        <div className="chart-section">
          <h3>Attendee Type Distribution (total)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={attendeeTypeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={140}
              >
                {attendeeTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.type] || COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                wrapperStyle={{ paddingLeft: '8px' }}
                content={renderLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Attendee Type by Year */}
        <div className="chart-section">
          <h3>Attendee Type Distribution by Year</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={attendeeByYearData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                style={{ fontSize: '14px' }}
              />
              <YAxis
                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', offset: 5, style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={60}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              {Object.keys(attendeeTypeCounts).map((type, index) => (
                <Bar
                  key={type}
                  dataKey={type}
                  stackId="a"
                  fill={COLOR_MAP[type] || COLOR_PALETTE[index % COLOR_PALETTE.length]}
                  name={type}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendee Type Trends */}
      <div className="chart-section">
        <h3>Attendee Type Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart data={trendData} margin={{ top: 20, right: 10, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              style={{ fontSize: '14px' }}
            />
            <YAxis
              label={{ value: 'Number of Attendees', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
              style={{ fontSize: '11px' }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ paddingLeft: '8px' }}
              content={renderLegend}
            />
            {Object.keys(attendeeTypeCounts).map((type, index) => (
              <Area
                key={type}
                type="monotone"
                dataKey={type}
                stackId="1"
                stroke={COLOR_MAP[type] || COLOR_PALETTE[index % COLOR_PALETTE.length]}
                fill={COLOR_MAP[type] || COLOR_PALETTE[index % COLOR_PALETTE.length]}
                fillOpacity={0.6}
                name={type}
              />
            ))}
          </ComposedChart>
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
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>👥</span>
            <strong style={{ color: '#1976D2' }}>Diverse Reach:</strong> Agricultural Producers (45.5%) and Conservation Professionals (29.5%) dominate, but diverse audience includes tribal land managers, biologists, students, and commercial operations
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🎓</span>
            <strong style={{ color: '#1976D2' }}>Growing Student Engagement:</strong> Large increase in Students & Educators in 2025 (17.4% vs 3.6% in 2022)
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>📊</span>
            <strong style={{ color: '#1976D2' }}>Knowledge Correlation:</strong> Attendee type strongly correlates with knowledge gained - land managers/owners gain more knowledge than technical professionals
          </li>
        </ul>
      </div>
    </section>
  )
}
