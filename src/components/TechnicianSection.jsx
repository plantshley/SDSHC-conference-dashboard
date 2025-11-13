import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import TechnicianProgramPotential from './TechnicianProgramPotential'

const COLORS = ['#90CAF9', '#BA68C8', '#F48FB1']

// Attendee type colors from Demographics page
const ATTENDEE_TYPE_COLORS = {
  'Agricultural Producers': '#FF69B4',        // Belgium pink
  'Conservation Professionals': '#87CEEB',    // Canada blue
  'Industry/Commercial': '#6A5ACD',           // Czech Republic purple
  'Land Managers & Owners': '#F0E68C',        // Egypt yellow
  'Students & Educators': '#DA70D6',          // Ukraine purple
  'Technical Professionals': '#FF6347',       // Greece red
  'Other Professionals': '#FA8072',           // Hong Kong coral
  'Other': '#FFB347',                         // Hungary orange
  'Unknown': '#9370DB'                        // Fiji purple
}

export default function TechnicianSection({ surveyData }) {
  // Technician interest levels - Score 1=Low, 2=Medium, 3=High
  // Only count applicable respondents (those who answered the question)
  const technicianCounts = { 'High': 0, 'Medium': 0, 'Low': 0 }
  let applicableRespondents = 0
  surveyData.forEach(row => {
    if (row.Technician_Interest_Score) {
      applicableRespondents++
      const score = row.Technician_Interest_Score
      if (score === 3) technicianCounts['High']++
      else if (score === 2) technicianCounts['Medium']++
      else if (score === 1) technicianCounts['Low']++
    }
  })

  const technicianData = Object.entries(technicianCounts).map(([level, count]) => ({
    level,
    count,
    percentage: ((count / applicableRespondents) * 100).toFixed(1)
  }))

  // Technician interest by attendee type
  const techByTypeData = {}
  surveyData.forEach(row => {
    if (row.Attendee_Type_Category && row.Technician_Interest_Score) {
      if (!techByTypeData[row.Attendee_Type_Category]) {
        techByTypeData[row.Attendee_Type_Category] = { High: 0, Medium: 0, Low: 0 }
      }
      const score = row.Technician_Interest_Score
      if (score === 3) techByTypeData[row.Attendee_Type_Category]['High']++
      else if (score === 2) techByTypeData[row.Attendee_Type_Category]['Medium']++
      else if (score === 1) techByTypeData[row.Attendee_Type_Category]['Low']++
    }
  })

  const techByTypeChartData = Object.entries(techByTypeData)
    .filter(([type]) => type !== 'Unknown')
    .map(([type, levels]) => ({
      type: type.length > 20 ? type.substring(0, 20) + '...' : type,
      fullType: type,
      ...levels
    }))

  // Helper function to darken a hex color
  const darkenColor = (hex, percent = 30) => {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)))
    const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)))
    const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)))
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      // Overall Interest Level (donut chart) - has 'level', 'count', 'percentage'
      if (data.level && data.percentage) {
        return (
          <div className="custom-tooltip">
            <p className="tooltip-title"><strong>{data.level}</strong></p>
            <p>Count: {data.count}</p>
            <p>Percentage: {data.percentage}%</p>
          </div>
        )
      }

      // Interest by Attendee Type - has 'fullType'
      if (data.fullType) {
        const baseColor = ATTENDEE_TYPE_COLORS[data.fullType] || ATTENDEE_TYPE_COLORS['Other']
        const darkColor = darkenColor(baseColor)
        const total = data.High + data.Medium + data.Low
        return (
          <div className="custom-tooltip">
            <p className="tooltip-title" style={{ color: darkColor }}><strong>{data.fullType}</strong></p>
            {payload.map((entry, index) => {
              const percentage = ((entry.value / total) * 100).toFixed(1)
              return (
                <p key={index} style={{ color: darkColor, fontWeight: 500 }}>
                  {entry.name}: {entry.value} ({percentage}%)
                </p>
              )
            })}
          </div>
        )
      }

      // Fallback
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.type || data.level}</strong></p>
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
      <h2>Soil Health Technician Program Interest</h2>
      <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', marginTop: '-12px', marginBottom: '20px' }}>
        Counts and percentages based on survey response data
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        {/* Technician Interest Distribution */}
        <div className="chart-section">
          <h3>Overall Interest Level</h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            Percentages of applicable respondents (202 out of 319 total survey responses)
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={technicianData}
                dataKey="count"
                nameKey="level"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={150}
                label={(props) => {
                  const { cx, cy, midAngle, innerRadius, outerRadius, level, percentage, count } = props
                  const RADIAN = Math.PI / 180
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                  const x = cx + radius * Math.cos(-midAngle * RADIAN)
                  const y = cy + radius * Math.sin(-midAngle * RADIAN)

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="#292929ff"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ fontSize: '13px', fontWeight: 400 }}
                    >
                      <tspan x={x} dy={-14}>{level}</tspan>
                      <tspan x={x} dy={14}>{percentage}%</tspan>
                      <tspan x={x} dy={14}>({count})</tspan>
                    </text>
                  )
                }}
                labelLine={false}
              >
                {technicianData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Technician Interest by Type */}
        <div className="chart-section">
          <h3>Interest by Attendee Type</h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
            Colors represent attendee types, with lighter shades indicating lower interest levels.
          </p>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={techByTypeChartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                angle={0}
                interval={0}
                height={60}
                style={{ fontSize: '10px' }}
                tick={{ width: 80, wordWrap: 'break-word' }}
              />
              <YAxis
                label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              <Bar dataKey="High" stackId="a" name="High Interest" fill="#6A5ACD">
                {techByTypeChartData.map((entry, index) => {
                  const baseColor = ATTENDEE_TYPE_COLORS[entry.fullType] || ATTENDEE_TYPE_COLORS['Other']
                  return <Cell key={`cell-${index}`} fill={baseColor} />
                })}
              </Bar>
              <Bar dataKey="Medium" stackId="a" name="Medium Interest" fill="#9B8FD1">
                {techByTypeChartData.map((entry, index) => {
                  const baseColor = ATTENDEE_TYPE_COLORS[entry.fullType] || ATTENDEE_TYPE_COLORS['Other']
                  const num = parseInt(baseColor.replace('#', ''), 16)
                  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * 0.5))
                  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * 0.5))
                  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * 0.5))
                  const lighterColor = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
                  return <Cell key={`med-${index}`} fill={lighterColor} />
                })}
              </Bar>
              <Bar dataKey="Low" stackId="a" name="Low Interest" fill="#CDBDE8">
                {techByTypeChartData.map((entry, index) => {
                  const baseColor = ATTENDEE_TYPE_COLORS[entry.fullType] || ATTENDEE_TYPE_COLORS['Other']
                  const num = parseInt(baseColor.replace('#', ''), 16)
                  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * 0.75))
                  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * 0.75))
                  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * 0.75))
                  const lightestColor = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
                  return <Cell key={`low-${index}`} fill={lightestColor} />
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <TechnicianProgramPotential surveyData={surveyData} />

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
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🌾</span>
            <strong style={{ color: '#1976D2' }}>Strong Interest:</strong> Land managers/owners and producers are more likely to express interest in technician assistance than professionals, educators, or students
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>✅</span>
            <strong style={{ color: '#1976D2' }}>Implementation Readiness:</strong> Among interested attendees, majority indicate likelihood to implement changes based on content learned at the conference, suggesting strong program potential
          </li>
        </ul>
      </div>
    </section>
  )
}
