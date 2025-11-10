import { BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#87CEEB', '#6A5ACD', '#9370DB', '#BA55D3']

// Color mapping for attendee types (matching Demographics page)
const COLOR_MAP = {
  'Agricultural Producers': '#FF69B4',
  'Conservation Professionals': '#87CEEB',
  'Industry/Commercial': '#6A5ACD',
  'Land Managers & Owners': '#F0E68C',
  'Students & Educators': '#DA70D6',
  'Technical Professionals': '#FF6347',
  'Other Professionals': '#FA8072',
  'Other': '#FFB347',
  'Unknown': '#9370DB'
}

// Helper function to darken a hex color
const darkenColor = (hex, percent = 30) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)))
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

// Custom tick component for wrapping x-axis labels
const CustomXAxisTick = ({ x, y, payload }) => {
  const lines = []
  const words = payload.value.split(' ')
  let currentLine = ''

  words.forEach((word, i) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length > 12 && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  })
  if (currentLine) lines.push(currentLine)

  return (
    <text x={x} y={y + 8} textAnchor="middle" style={{ fontSize: '10px', fill: '#666' }}>
      {lines.map((line, index) => (
        <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

export default function SatisfactionDriversAnalysis({ surveyData }) {
  // Calculate statistics by year
  const statsByYear = {}

  surveyData.forEach(row => {
    if (row.year && row.Satisfaction_Rating && row.Knowledge_Gain_Rating) {
      if (!statsByYear[row.year]) {
        statsByYear[row.year] = {
          satisfaction: [],
          knowledge: []
        }
      }
      statsByYear[row.year].satisfaction.push(row.Satisfaction_Rating)
      statsByYear[row.year].knowledge.push(row.Knowledge_Gain_Rating)
    }
  })

  // Calculate box plot statistics
  const calculateBoxStats = (values) => {
    const sorted = [...values].sort((a, b) => a - b)
    const q1Index = Math.floor(sorted.length * 0.25)
    const medianIndex = Math.floor(sorted.length * 0.5)
    const q3Index = Math.floor(sorted.length * 0.75)

    return {
      min: sorted[0],
      q1: sorted[q1Index],
      median: sorted[medianIndex],
      q3: sorted[q3Index],
      max: sorted[sorted.length - 1],
      mean: sorted.reduce((a, b) => a + b, 0) / sorted.length
    }
  }

  const yearData = Object.keys(statsByYear).sort().map(year => {
    const satStats = calculateBoxStats(statsByYear[year].satisfaction)
    const knowStats = calculateBoxStats(statsByYear[year].knowledge)

    return {
      year,
      satMean: satStats.mean,
      satMedian: satStats.median,
      satQ1: satStats.q1,
      satQ3: satStats.q3,
      knowMean: knowStats.mean,
      knowMedian: knowStats.median,
      knowQ1: knowStats.q1,
      knowQ3: knowStats.q3
    }
  })

  // Calculate statistics by attendee type
  const statsByType = {}

  surveyData.forEach(row => {
    if (row.Attendee_Type_Category && row.Satisfaction_Rating && row.Knowledge_Gain_Rating) {
      if (!statsByType[row.Attendee_Type_Category]) {
        statsByType[row.Attendee_Type_Category] = {
          satisfaction: [],
          knowledge: []
        }
      }
      statsByType[row.Attendee_Type_Category].satisfaction.push(row.Satisfaction_Rating)
      statsByType[row.Attendee_Type_Category].knowledge.push(row.Knowledge_Gain_Rating)
    }
  })

  const typeData = Object.keys(statsByType).map(type => {
    const satStats = calculateBoxStats(statsByType[type].satisfaction)
    const knowStats = calculateBoxStats(statsByType[type].knowledge)

    return {
      type: type.length > 20 ? type.substring(0, 20) + '...' : type,
      fullType: type,
      satMean: satStats.mean,
      knowMean: knowStats.mean,
      satMedian: satStats.median,
      knowMedian: knowStats.median
    }
  }).sort((a, b) => b.satMean - a.satMean)

  // Satisfaction vs Knowledge scatter data - group by combination
  const scatterCombinations = {}
  surveyData.forEach(row => {
    if (row.Satisfaction_Rating && row.Knowledge_Gain_Rating) {
      const key = `${row.Satisfaction_Rating}-${row.Knowledge_Gain_Rating}`
      if (!scatterCombinations[key]) {
        scatterCombinations[key] = {
          satisfaction: row.Satisfaction_Rating,
          knowledge: row.Knowledge_Gain_Rating,
          count: 0
        }
      }
      scatterCombinations[key].count++
    }
  })

  const scatterTotal = Object.values(scatterCombinations).reduce((sum, item) => sum + item.count, 0)
  const scatterData = Object.values(scatterCombinations).map(item => ({
    ...item,
    percentage: ((item.count / scatterTotal) * 100).toFixed(1)
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      // For attendee type chart
      if (data.fullType) {
        const color = COLOR_MAP[data.fullType] || '#333'
        const darkColor = darkenColor(color)

        return (
          <div className="custom-tooltip">
            <p className="tooltip-title" style={{ color: darkColor }}>
              <strong>{data.fullType}</strong>
            </p>
            {payload.map((entry, index) => {
              const isSatisfaction = entry.name.includes('Satisfaction')
              const unit = isSatisfaction ? '/5 stars' : '/4 stars'
              return (
                <p key={index} style={{ color: darkColor, fontWeight: 500 }}>
                  {entry.name}: {entry.value.toFixed(2)}{unit}
                </p>
              )
            })}
          </div>
        )
      }

      // For scatter chart
      if (data.count !== undefined && data.percentage !== undefined) {
        return (
          <div className="custom-tooltip">
            <p className="tooltip-title"><strong>Satisfaction: {data.satisfaction}/5, Knowledge: {data.knowledge}/4</strong></p>
            <p style={{ color: '#42A5F5' }}>Count: {data.count}</p>
            <p style={{ color: '#42A5F5' }}>Percentage: {data.percentage}%</p>
          </div>
        )
      }

      // Default tooltip for other charts
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.year}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>Satisfaction Drivers Analysis</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '24px' }}>
        {/* Satisfaction vs Knowledge Scatter */}
        <div className="chart-section">
          <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Satisfaction vs Knowledge Gain</h4>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Bubble size represents number of responses.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 5, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="satisfaction"
                name="Satisfaction"
                domain={[0, 6]}
                label={{ value: 'Satisfaction Rating (1-5)', position: 'insideBottom', offset: -5 }}
                style={{ fontSize: '11px' }}
              />
              <YAxis
                type="number"
                dataKey="knowledge"
                name="Knowledge"
                domain={[0, 5]}
                label={{ value: 'Knowledge Gain (1-4)', angle: -90, position: 'insideLeft', offset: 5, style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={60}
              />
              <ZAxis type="number" dataKey="count" range={[100, 800]} name="Count" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              <Scatter name="Responses" data={scatterData} fill="#9FA8DA" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* By Attendee Type */}
        <div className="chart-section">
          <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Average Ratings by Attendee Type</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={typeData} margin={{ top: 5, right: 5, left: 10, bottom: 10 }} layout="horizontal" barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                interval={0}
                height={50}
                tick={<CustomXAxisTick />}
              />
              <YAxis
                domain={[0, 5]}
                label={{ value: 'Rating (Knowledge: /4, Satisfaction: /5)', angle: -90, position: 'insideLeft', offset: 15, style: { textAnchor: 'middle', fontSize: '13px' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              <Bar dataKey="knowMean" fill="#F48FB1" name="Knowledge Gain (Mean)" />
              <Bar dataKey="satMean" fill="#BA68C8" name="Satisfaction (Mean)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
