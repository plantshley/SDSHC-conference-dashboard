import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#90CAF9', '#BA68C8', '#F48FB1', '#9FA8DA']

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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.year || payload[0].payload.fullType}</strong></p>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* By Year */}
        <div className="chart-section">
          <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Average Ratings by Year</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={yearData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" style={{ fontSize: '11px' }} />
              <YAxis
                domain={[0, 5]}
                label={{ value: 'Rating', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              <Bar dataKey="satMean" fill="#90CAF9" name="Satisfaction (Mean)" />
              <Bar dataKey="knowMean" fill="#BA68C8" name="Knowledge Gain (Mean)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Attendee Type */}
        <div className="chart-section">
          <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Average Ratings by Attendee Type</h4>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={typeData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="type"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '10px' }}
              />
              <YAxis
                domain={[0, 5]}
                label={{ value: 'Rating', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              <Bar dataKey="satMean" fill="#F48FB1" name="Satisfaction (Mean)" />
              <Bar dataKey="knowMean" fill="#9FA8DA" name="Knowledge Gain (Mean)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
