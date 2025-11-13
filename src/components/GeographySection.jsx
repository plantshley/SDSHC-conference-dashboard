import { BarChart, Bar, PieChart, Pie, Cell, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import MapView from './MapView'

const COLORS = ['#87CEEB', '#6A5ACD', '#9370DB', '#BA55D3', '#DA70D6', '#EE82EE', '#FF69B4', '#FF1493', '#FF6347', '#FA8072', '#FFB347', '#F0E68C', '#9ACD32', '#90EE90', '#00FA9A']

// Distinct colors for top 5 states
const TOP_STATE_COLORS = ['#87CEEB', '#6A5ACD', '#FF69B4', '#FF6347', '#F0E68C']

export default function GeographySection({ geoStateOverall, geoStateByEvent, geoCityOverall }) {
  // Top 15 states - exclude international countries
  const topStates = geoStateOverall
    .filter(row => row.State_Name && row.State_Name !== '' && (!row.Country || row.Country === 'USA'))
    .slice(0, 15)
    .map(row => ({
      state: row.State_Name || row.state,
      count: parseInt(row.Count),
      percentage: row.Percentage
    }))

  // International attendance - use geoStateByEvent to get year information
  const international = geoStateByEvent.filter(row => row.Country && row.Country !== 'USA')

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
      countryData[countryName] = { count: 0, years: [] }
    }
    countryData[countryName].count += parseInt(row.Count)
    // Extract year from event field
    if (row.event) {
      const yearMatch = row.event.match(/\d{4}/)
      if (yearMatch && !countryData[countryName].years.includes(yearMatch[0])) {
        countryData[countryName].years.push(yearMatch[0])
      }
    }
  })

  const internationalData = Object.entries(countryData)
    .map(([country, data]) => ({
      country,
      count: data.count,
      years: data.years.sort()
    }))
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

  // State trends - Calculate top 5 states by total attendance
  const years = ['2022 Soil Health Conference', '2023 Soil Health Conference', '2024 Soil Health Conference', '2025 Soil Health Conference']

  // Calculate total attendance per state across all years
  const stateTotals = {}
  geoStateByEvent.forEach(row => {
    if (row.State_Name && row.State_Name !== 'Unknown') {
      stateTotals[row.State_Name] = (stateTotals[row.State_Name] || 0) + parseInt(row.Count || 0)
    }
  })

  // Get top 5 states
  const top5States = Object.entries(stateTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([state]) => state)

  // Prepare data for area chart (top 5 states)
  const stateTrendData = years.map(yearLabel => {
    const year = yearLabel
    const data = { year: yearLabel.replace(' Soil Health Conference', '') }

    top5States.forEach(state => {
      const stateData = geoStateByEvent.find(row =>
        row.State_Name === state && row.event === year
      )
      data[state] = stateData ? parseInt(stateData.Count) : 0
    })

    return data
  })

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

      // International chart - show Country (#)
      if (data.country && data.count !== undefined) {
        const colorIndex = internationalData.findIndex(d => d.country === data.country)
        const color = COLORS[colorIndex % COLORS.length]
        const darkColor = darkenColor(color)
        return (
          <div className="custom-tooltip">
            <p className="tooltip-title" style={{ color: darkColor }}>
              <strong>{data.country}</strong>
            </p>
            <p style={{ color: darkColor, fontWeight: 500 }}>
              Count: {data.count}
            </p>
            {data.years && data.years.length > 0 && (
              <p style={{ color: darkColor, fontWeight: 500 }}>
                Year{data.years.length > 1 ? 's' : ''}: {data.years.join(', ')}
              </p>
            )}
          </div>
        )
      }

      // State Attendance Trends - use darker shades of state colors
      if (data.year && top5States.some(state => data[state] !== undefined)) {
        return (
          <div className="custom-tooltip">
            <p className="tooltip-title"><strong>{data.year}</strong></p>
            {payload.map((entry, index) => {
              const darkColor = darkenColor(entry.color)
              return (
                <p key={index} style={{ color: darkColor, fontWeight: 500 }}>
                  {entry.name}: {entry.value}
                </p>
              )
            })}
          </div>
        )
      }

      // Other charts (Top States and Top Cities)
      if (data.state || data.city) {
        return (
          <div className="custom-tooltip">
            <p className="tooltip-title"><strong>{data.state || data.city}</strong></p>
            <p style={{ fontWeight: 500 }}>
              Registrations: {data.count} ({data.percentage}%)
            </p>
          </div>
        )
      }

      // Fallback
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.state || data.city}</strong></p>
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
          <h3>Top 15 States</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topStates} margin={{ top: 5, right: 30, left: 10, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" style={{ fontSize: '11px' }} />
              <YAxis
                type="category"
                dataKey="state"
                width={80}
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
            <BarChart data={topCities} margin={{ top: 5, right: 30, left: 10, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" style={{ fontSize: '11px' }} />
              <YAxis
                type="category"
                dataKey="city"
                width={95}
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
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px', fontWeight: 400, textAlign: 'center' }}>
            with attendees visiting from many countries, including:
          </p>
          <ResponsiveContainer width="100%" height={370}>
            <PieChart>
              <Legend
                verticalAlign="top"
                align="center"
                layout="horizontal"
                height={50}
                wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
              />
              <Pie
                data={internationalData}
                dataKey="count"
                nameKey="country"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={130}
                label={false}
              >
                {internationalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* South Dakota Regional Distribution Map */}
        <div className="chart-section">
          <h3>South Dakota Regional Distribution</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Interactive map of South Dakota cities. Circle size represents ticket registration counts.
          </p>
          <MapView geoCityOverall={geoCityOverall} />
        </div>

        {/* State Trends */}
        <div className="chart-section">
          <h3>State Attendance Trends</h3>
          <ResponsiveContainer width="100%" height={450}>
            <ComposedChart data={stateTrendData} margin={{ top: 50, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                style={{ fontSize: '14px' }}
              />
              <YAxis
                label={{ value: 'Number of Ticket Registrations', angle: -90, position: 'insideLeft', offset: 5, style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={40}
                wrapperStyle={{ fontSize: '12px', fontWeight: 600, top: 0 }}
                layout="horizontal"
              />
              {top5States.map((state, index) => (
                <Area
                  key={state}
                  type="monotone"
                  dataKey={state}
                  stackId="1"
                  stroke={TOP_STATE_COLORS[index]}
                  fill={TOP_STATE_COLORS[index]}
                  fillOpacity={0.6}
                  name={state}
                />
              ))}
            </ComposedChart>
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
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🏘️</span>
            <strong style={{ color: '#1976D2' }}>Exceptional Reach:</strong> Attendees from over 260 communities, 48 states & provinces, and 14 countries - from local South Dakota to Morocco, Greece, India, and Fiji
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🗺️</span>
            <strong style={{ color: '#1976D2' }}>Regional Leader:</strong> South Dakota dominates with 56% of registrations, followed by Missouri, Minnesota, and Nebraska
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>📈</span>
            <strong style={{ color: '#1976D2' }}>Growing Attendance:</strong> Overall increasing attendance from 251 (2022) to 391 (2025), though survey response rate declining
          </li>
        </ul>
      </div>

      <div style={{
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{
          padding: '20px 80px',
          background: 'linear-gradient(270deg, #90CAF9, #9FA8DA, #BA68C8, #CE93D8, #F48FB1, #FF80AB, #90CAF9, #9FA8DA)',
          backgroundSize: '700% 100%',
          animation: 'gradientShift 20s linear infinite',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'visible',
          display: 'inline-block'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: '18px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ animation: 'float 3s ease-in-out infinite' }}>🗺️</span>
              <span style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}>📍</span>
              <span style={{ animation: 'float 3s ease-in-out infinite 1s' }}>🌍</span>
            </div>

            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 12px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              want more detailed maps?
            </h3>

            <span className="metrics-link-group">
              <a
                href="/2022-25 Soil Health Conference Attendee Maps.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: 'white',
                  color: '#BA68C8',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  borderRadius: '50px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                View Geographic Visualization PDF →
                <span className="metrics-emoji metrics-emoji-1">🗺️</span>
                <span className="metrics-emoji metrics-emoji-2">📍</span>
                <span className="metrics-emoji metrics-emoji-3">🌍</span>
                <span className="metrics-emoji metrics-emoji-4">📄</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
