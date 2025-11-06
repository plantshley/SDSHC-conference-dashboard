import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#90CAF9', '#BA68C8', '#F48FB1']

export default function TechnicianSection({ surveyData }) {
  // Technician interest levels - Score 1=Low, 2=Medium, 3=High
  const technicianCounts = { 'High': 0, 'Medium': 0, 'Low': 0 }
  surveyData.forEach(row => {
    if (row.Technician_Interest_Score) {
      const score = row.Technician_Interest_Score
      if (score === 3) technicianCounts['High']++
      else if (score === 2) technicianCounts['Medium']++
      else if (score === 1) technicianCounts['Low']++
    }
  })

  const technicianData = Object.entries(technicianCounts).map(([level, count]) => ({
    level,
    count
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

  const techByTypeChartData = Object.entries(techByTypeData).map(([type, levels]) => ({
    type: type.length > 20 ? type.substring(0, 20) + '...' : type,
    ...levels
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.level || payload[0].payload.type}</strong></p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Technician Interest Distribution */}
        <div className="chart-section">
          <h3>Overall Interest Level</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={technicianData}
                dataKey="count"
                nameKey="level"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={(entry) => `${entry.level}: ${entry.count}`}
              >
                {technicianData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Technician Interest by Type */}
        <div className="chart-section">
          <h3>Interest by Attendee Type</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={techByTypeChartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                angle={-15}
                textAnchor="end"
                height={100}
                style={{ fontSize: '11px' }}
              />
              <YAxis
                label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              <Bar dataKey="High" stackId="a" fill="#90CAF9" name="High Interest" />
              <Bar dataKey="Medium" stackId="a" fill="#BA68C8" name="Medium Interest" />
              <Bar dataKey="Low" stackId="a" fill="#F48FB1" name="Low Interest" />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
            <strong style={{ color: '#1976D2' }}>Strong Demand:</strong> High interest in technical assistance across all attendee types
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
            <strong style={{ color: '#1976D2' }}>Program Potential:</strong> Clear opportunity for soil health technician program expansion
          </li>
        </ul>
      </div>
    </section>
  )
}
