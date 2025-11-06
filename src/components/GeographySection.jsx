import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import MapView from './MapView'

const COLORS = ['#90CAF9', '#9FA8DA', '#BA68C8', '#CE93D8', '#F48FB1', '#FF80AB', '#81D4FA', '#5C6BC0', '#7986CB', '#9575CD']

export default function GeographySection({ geoStateOverall, geoStateByEvent, geoCityOverall }) {
  // Top 10 states
  const topStates = geoStateOverall
    .filter(row => row.State_Name && row.State_Name !== '')
    .slice(0, 10)
    .map(row => ({
      state: row.State_Name || row.state,
      count: parseInt(row.Count),
      percentage: row.Percentage
    }))

  // International attendance
  const international = geoStateOverall.filter(row => row.Country && row.Country !== 'USA')

  const countryNames = {
    'CZ': 'Czech Republic',
    'FJ': 'Fiji',
    'MA': 'Morocco',
    'BE': 'Belgium',
    'HU': 'Hungary',
    'HK': 'Hong Kong',
    'GR': 'Greece',
    'IN': 'India',
    'NI': 'Nicaragua',
    'UA': 'Ukraine',
    'EG': 'Egypt',
    'CA': 'Canada'
  }

  const countryData = {}
  international.forEach(row => {
    const countryCode = row.Country
    const countryName = countryNames[countryCode] || countryCode
    if (!countryData[countryName]) {
      countryData[countryName] = 0
    }
    countryData[countryName] += parseInt(row.Count)
  })

  const internationalData = Object.entries(countryData)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  // Top 15 cities
  const topCities = geoCityOverall
    .filter(row => row.City && row.City !== '')
    .slice(0, 15)
    .map(row => ({
      city: (row.Full_Location || (row.City + ', ' + row.State)).replace(', USA', ''),
      count: parseInt(row.Count),
      percentage: row.Percentage
    }))

  // State trends
  const topStateTrends = ['South Dakota', 'Missouri', 'Minnesota', 'Nebraska', 'North Dakota', 'Iowa']
  const years = ['2022 Soil Health Conference', '2023 Soil Health Conference', '2024 Soil Health Conference', '2025 Soil Health Conference']

  const stateTrendData = years.map(yearLabel => {
    const year = yearLabel
    const data = { year: yearLabel.replace(' Soil Health Conference', '') }

    topStateTrends.forEach(state => {
      const stateData = geoStateByEvent.find(row =>
        row.State_Name === state && row.event === year
      )
      data[state] = stateData ? parseInt(stateData.Count) : 0
    })

    return data
  })

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.state || payload[0].payload.city || payload[0].payload.country || payload[0].payload.year}</strong></p>
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
      <h2>Geographic Reach</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
        {/* Top States */}
        <div className="chart-section">
          <h3>Top States by Attendance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topStates} margin={{ top: 5, right: 30, left: 70, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" style={{ fontSize: '11px' }} />
              <YAxis
                type="category"
                dataKey="state"
                width={100}
                style={{ fontSize: '11px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#90CAF9" name="Ticket Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Cities */}
        <div className="chart-section">
          <h3>Top 15 Cities</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topCities} margin={{ top: 5, right: 30, left: 120, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" style={{ fontSize: '11px' }} />
              <YAxis
                type="category"
                dataKey="city"
                width={110}
                style={{ fontSize: '10px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#BA68C8" name="Registrations" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* International Attendance */}
        <div className="chart-section">
          <h3>International Attendance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={internationalData}
                dataKey="count"
                nameKey="country"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.count > 1 ? `${entry.country}: ${entry.count}` : entry.count}
              >
                {internationalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={60} wrapperStyle={{ fontSize: '10px', fontWeight: 600 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* South Dakota Regional Distribution Map */}
        <div className="chart-section">
          <h3>South Dakota Regional Distribution</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Interactive map of South Dakota cities. Circle size and color represent ticket registration counts.
          </p>
          <MapView geoCityOverall={geoCityOverall} />
        </div>

        {/* State Trends */}
        <div className="chart-section">
          <h3>State Attendance Trends</h3>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={stateTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
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
              {topStateTrends.map((state, index) => (
                <Line
                  key={state}
                  type="monotone"
                  dataKey={state}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  name={state}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
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
        <h3 style={{ color: '#1976D2', marginBottom: '20px' }}>Geographic Impact</h3>
        <p style={{
          marginBottom: '16px',
          padding: '16px',
          background: 'white',
          borderLeft: '4px solid #42A5F5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <strong>📍 View Detailed Maps:</strong> See the full <a
            href="/2022-25 Soil Health Conference Attendee Maps.pdf"
            target="_blank"
            style={{ color: '#1976D2', fontWeight: 700, textDecoration: 'underline' }}
          >
            2022-25 Soil Health Conference Attendee Maps PDF
          </a> for comprehensive geographic visualization.
        </p>
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
            <strong style={{ color: '#1976D2' }}>Exceptional Reach:</strong> Attendees from over 260 communities, 48 states & provinces, and 14 countries - from local South Dakota to Morocco, Greece, India, and Fiji
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
            <strong style={{ color: '#1976D2' }}>Regional Leader:</strong> South Dakota dominates with 56% of registrations, followed by Missouri, Minnesota, and Nebraska
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
            <strong style={{ color: '#1976D2' }}>Growing Attendance:</strong> Overall increasing attendance from 251 (2022) to 391 (2025), though survey response rate declining
          </li>
        </ul>
      </div>
    </section>
  )
}
