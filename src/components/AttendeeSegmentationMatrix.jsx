import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const COLORS = {
  'Agricultural Producers': '#87CEEB',
  'Conservation Professionals': '#6A5ACD',
  'Students & Educators': '#9370DB',
  'Land Managers & Owners': '#BA55D3',
  'Technical Professionals': '#DA70D6',
  'Industry/Commercial': '#EE82EE',
  'Other Professionals': '#FF69B4',
  'Other': '#FF1493'
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
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.type}</strong></p>
          <p>Knowledge Gain: {data.knowledge}/4</p>
          <p>Implementation: {data.likelihoodLabel}</p>
          <p>Attendees: {data.count}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="chart-section" style={{ marginTop: '24px' }}>
      <h3>Attendee Segmentation Matrix</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Knowledge gain vs implementation likelihood by attendee type. Bubble size represents number of attendees.
      </p>
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="knowledge"
            name="Knowledge Gain"
            domain={[0.5, 4.5]}
            ticks={[1, 2, 3, 4]}
            label={{ value: 'Knowledge Gain Rating (1=Little, 4=Excellent)', position: 'insideBottom', offset: -10 }}
            style={{ fontSize: '11px' }}
          />
          <YAxis
            type="number"
            dataKey="likelihood"
            name="Likelihood"
            domain={[0.5, 4.5]}
            ticks={[1, 2, 3, 4]}
            label={{ value: 'Likelihood to Implement', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            style={{ fontSize: '11px' }}
            tickFormatter={(value) => LIKELIHOOD_MAP[value] || ''}
          />
          <ZAxis type="number" dataKey="count" range={[100, 1000]} name="Count" />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend
            verticalAlign="top"
            height={50}
            wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
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
                fillOpacity={0.7}
              />
            )
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
