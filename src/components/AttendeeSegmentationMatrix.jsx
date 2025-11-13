import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Map attendee types to colors matching the international reach chart legend order
// Belgium pink, Canada blue, Czech purple, Egypt yellow, etc.
const COLORS = {
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

const LIKELIHOOD_MAP = {
  1: 'Unlikely',
  2: 'Maybe',
  3: 'Likely',
  4: 'Very Likely'
}

export default function AttendeeSegmentationMatrix({ surveyData }) {
  // Group data by attendee type, knowledge gain, and likelihood
  const segmentData = {}

  surveyData.forEach(row => {
    if (row.Attendee_Type_Category && row.Knowledge_Gain_Rating && row.Likelihood_Score) {
      const key = `${row.Attendee_Type_Category}-${row.Knowledge_Gain_Rating}-${row.Likelihood_Score}`
      if (!segmentData[key]) {
        segmentData[key] = {
          type: row.Attendee_Type_Category,
          knowledge: row.Knowledge_Gain_Rating,
          likelihood: row.Likelihood_Score,
          likelihoodLabel: LIKELIHOOD_MAP[row.Likelihood_Score],
          count: 0
        }
      }
      segmentData[key].count++
    }
  })

  const scatterData = Object.values(segmentData)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const point = payload[0]?.payload

      if (!point || !point.type) return null

      const knowledge = point.knowledge
      const likelihood = point.likelihood
      const likelihoodLabel = point.likelihoodLabel

      // Find all data points with the same knowledge and likelihood
      const sameSegment = scatterData.filter(d =>
        d.knowledge === knowledge && d.likelihood === likelihood
      )

      // Calculate total count for this segment
      const totalCount = sameSegment.reduce((sum, d) => sum + d.count, 0)

      // Build breakdown by type with counts
      const breakdown = sameSegment.map(d => ({
        type: d.type,
        count: d.count
      })).sort((a, b) => b.count - a.count)

      return (
        <div className="custom-tooltip" style={{ minWidth: '200px', maxWidth: '350px' }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Knowledge Gain: {knowledge}/4</p>
          <p style={{ fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap' }}>Likelihood to Implement: {likelihoodLabel}</p>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>Number of Respondents: {totalCount}</p>
          <div style={{ fontSize: '9px', paddingLeft: '8px' }}>
            {breakdown.map((b) => {
              const color = COLORS[b.type] || '#333'
              const darkColor = darkenColor(color)
              return (
                <p key={b.type} style={{ color: darkColor, fontWeight: 500, margin: '2px 0' }}>
                  {b.type}: {b.count}
                </p>
              )
            })}
          </div>
        </div>
      )
    }
    return null
  }

  // Custom legend formatter to darken text color
  const renderLegend = (props) => {
    const { payload } = props
    return (
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        fontSize: '12px',
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
    <div className="chart-section" style={{ marginTop: '24px' }}>
      <h3>Attendee Segmentation Matrix</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Knowledge Gain vs Implementation Likelihood by attendee type. Bubble size represents number of attendees.
      </p>
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 70, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="knowledge"
            name="Knowledge Gain"
            domain={[0.5, 4.5]}
            ticks={[1, 2, 3, 4]}
            label={{ value: 'Knowledge Gain Rating (1=Little, 4=Excellent)', position: 'insideBottom', offset: -20 }}
            style={{ fontSize: '14px' }}
          />
          <YAxis
            type="number"
            dataKey="likelihood"
            name="Likelihood"
            domain={[0.5, 4.5]}
            ticks={[1, 2, 3, 4]}
            label={{ value: 'Likelihood To Implement', angle: -90, position: 'insideLeft', offset: 5, style: { textAnchor: 'middle' } }}
            style={{ fontSize: '14px' }}
            tickFormatter={(value) => LIKELIHOOD_MAP[value] || ''}
            width={85}
          />
          <ZAxis type="number" dataKey="count" range={[800, 5000]} name="Count" />
          <Tooltip
            content={<CustomTooltip />}
            //allowEscapeViewBox={{ x: true, y: true }}
            wrapperStyle={{ zIndex: 1000 }}
            isAnimationActive={false}
          />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ paddingLeft: '10px' }}
            content={renderLegend}
          />
          {Object.keys(COLORS).map((type) => {
            const typeData = scatterData.filter(d => d.type === type)
            if (typeData.length === 0) return null
            return (
              <Scatter
                key={type}
                name={type}
                data={typeData}
                fill={COLORS[type]}
                isAnimationActive={false}
              />
            )
          })}
        </ScatterChart>
      </ResponsiveContainer>

      <div style={{
        color: '#333',
        padding: '0',
        marginTop: '0'
      }}>
        <h4 style={{ color: '#7B1FA2', marginBottom: '12px', fontSize: '16px' }}>Interpretation</h4>
        <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
          This matrix reveals distinct patterns across attendee types. <strong>Land Managers & Owners</strong> cluster in the high knowledge gain area, suggesting they're newer to soil health practices and benefit greatly from conference content. <strong>Agricultural Producers</strong> show the strongest implementation intentions across all knowledge levels, demonstrating high engagement and actionability. <strong>Conservation Professionals</strong> and <strong>Technical Professionals</strong> tend toward lower knowledge gain (already familiar with concepts) but maintain moderate-to-high implementation likelihood, indicating they're translating concepts into their professional work. Larger bubbles represent higher attendance in those segments.
        </p>
      </div>
    </div>
  )
}
