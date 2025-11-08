import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

export default function OverviewSection({ surveyData }) {
  // Prepare attendance data
  const attendanceData = [
    { year: '2022', registrations: 251, responses: 0 },
    { year: '2023', registrations: 254, responses: 102 },
    { year: '2024', registrations: 307, responses: 149 },
    { year: '2025', registrations: 391, responses: 68 }
  ]

  // Correlation data from the metric tables
  const correlationData = [
    { pair: 'Satisfaction & Knowledge Gain', correlation: 0.72 },
    { pair: 'Technician Interest & Implement Likelihood', correlation: 0.68 },
    { pair: 'Satisfaction & Implement Likelihood', correlation: 0.58 },
    { pair: 'Knowledge Gain & Implement Likelihood', correlation: 0.54 }
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

  const CorrelationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.pair}</strong></p>
          <p style={{ color: '#42A5F5' }}>Correlation: {payload[0].value.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <section>
      <div className="chart-section">
        <h3>Conference Attendance Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={attendanceData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
              style={{ fontSize: '14px' }}
            />
            <YAxis
              label={{ value: 'Number of People', angle: -90, position: 'insideLeft', offset: 5, style: { textAnchor: 'middle' } }}
              style={{ fontSize: '11px' }}
              width={60}
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
              strokeWidth={3}
              name="Ticket Registrations"
              dot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="responses"
              stroke="#F48FB1"
              strokeWidth={3}
              name="Survey Responses"
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-section" style={{ marginTop: '32px' }}>
        <h3>Strongest Connections in Conference Impact</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
          The conference creates a positive cycle - satisfaction, learning, and action reinforce each other. Attendees who learn more are happier and more likely to make changes on their operations.
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          {/* Top 4 strongest correlations */}
          <div style={{
            background: 'linear-gradient(90deg, #E3F2FD 0%, #BBDEFB 100%)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderLeft: '5px solid #90CAF9'
          }}>
            <div style={{ fontSize: '24px' }}>📚</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                Knowledge Gained ⟷ Satisfaction
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Very Strong Connection - Learning more leads to higher satisfaction
              </div>
            </div>
            <div style={{
              background: '#90CAF9',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              Strongest
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(90deg, #F3E5F5 0%, #E1BEE7 100%)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderLeft: '5px solid #BA68C8'
          }}>
            <div style={{ fontSize: '24px' }}>🌱</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                Implementation Intention ⟷ Satisfaction
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Strong Connection - Satisfied attendees plan to make changes
              </div>
            </div>
            <div style={{
              background: '#BA68C8',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              Strong
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(90deg, #F3E5F5 0%, #E1BEE7 100%)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderLeft: '5px solid #BA68C8'
          }}>
            <div style={{ fontSize: '24px' }}>💡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                Implementation Intention ⟷ Knowledge Gained
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Strong Connection - Learning drives action on the farm
              </div>
            </div>
            <div style={{
              background: '#BA68C8',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              Strong
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(90deg, #FCE4EC 0%, #F8BBD0 100%)',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderLeft: '5px solid #F48FB1'
          }}>
            <div style={{ fontSize: '24px' }}>🔧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                Technician Interest ⟷ Implementation Intention
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Moderate Connection - Those seeking help are more likely to implement
              </div>
            </div>
            <div style={{
              background: '#F48FB1',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}>
              Moderate
            </div>
          </div>
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
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🎓</span>
            <strong style={{ color: '#1976D2' }}>Beginner Focus:</strong> Attendees who gained more knowledge from the conferences (indicating beginners) likely learned most about tillage and cover crops, suggesting that dedicating more content to other topics may be beneficial
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
              <span style={{ animation: 'float 3s ease-in-out infinite' }}>📊</span>
              <span style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}>📈</span>
              <span style={{ animation: 'float 3s ease-in-out infinite 1s' }}>📋</span>
            </div>

            <h3 style={{
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 12px 0',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              want more numbers?
            </h3>

            <span className="metrics-link-group">
              <a
                href={import.meta.env.BASE_URL + '2022-25 Soil Health Conference Attendee Maps.pdf'}
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
                View Full Metric Tables →
                <span className="metrics-emoji metrics-emoji-1">📊</span>
                <span className="metrics-emoji metrics-emoji-2">📈</span>
                <span className="metrics-emoji metrics-emoji-3">📉</span>
                <span className="metrics-emoji metrics-emoji-4">📋</span>
              </a>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
