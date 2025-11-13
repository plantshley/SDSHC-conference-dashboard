import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts'
import SatisfactionDriversAnalysis from './SatisfactionDriversAnalysis'

const COLORS = ['#87CEEB', '#6A5ACD', '#9370DB', '#BA55D3', '#DA70D6', '#EE82EE', '#FF69B4']

export default function ImpactSection({ surveyData }) {
  // Implementation likelihood distribution
  const implementationCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
  surveyData.forEach(row => {
    if (row.Likelihood_Score && row.Likelihood_Score >= 1 && row.Likelihood_Score <= 4) {
      implementationCounts[row.Likelihood_Score]++
    }
  })

  const implementationTotal = Object.values(implementationCounts).reduce((a, b) => a + b, 0)
  const implementationData = Object.entries(implementationCounts).map(([score, count]) => ({
    score: `${score} - ${{ 1: 'Unlikely', 2: 'Maybe', 3: 'Likely', 4: 'Very Likely' }[score]}`,
    count,
    percentage: ((count / implementationTotal) * 100).toFixed(1)
  }))

  // Satisfaction distribution
  const satisfactionCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  surveyData.forEach(row => {
    if (row.Satisfaction_Rating && row.Satisfaction_Rating >= 1 && row.Satisfaction_Rating <= 5) {
      satisfactionCounts[row.Satisfaction_Rating]++
    }
  })

  const satisfactionTotal = Object.values(satisfactionCounts).reduce((a, b) => a + b, 0)
  const satisfactionData = Object.entries(satisfactionCounts).map(([stars, count]) => ({
    stars: `${stars} ${stars === '1' ? 'Star' : 'Stars'}`,
    count,
    percentage: ((count / satisfactionTotal) * 100).toFixed(1)
  }))

  // Knowledge gain distribution
  const knowledgeCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
  surveyData.forEach(row => {
    if (row.Knowledge_Gain_Rating && row.Knowledge_Gain_Rating >= 1 && row.Knowledge_Gain_Rating <= 4) {
      knowledgeCounts[row.Knowledge_Gain_Rating]++
    }
  })

  const knowledgeTotal = Object.values(knowledgeCounts).reduce((a, b) => a + b, 0)
  const knowledgeData = Object.entries(knowledgeCounts).map(([score, count]) => ({
    score: `${score} - ${{ 1: 'Little', 2: 'Some', 3: 'Good', 4: 'Excellent' }[score]}`,
    count,
    percentage: ((count / knowledgeTotal) * 100).toFixed(1)
  }))

  // Satisfaction vs Knowledge scatter
  const scatterData = surveyData
    .filter(row => row.Satisfaction_Rating && row.Knowledge_Gain_Rating)
    .map(row => ({
      satisfaction: row.Satisfaction_Rating,
      knowledge: row.Knowledge_Gain_Rating,
      year: row.year
    }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{data.score || data.stars}</strong></p>
          <p style={{ color: '#42A5F5' }}>Count: {payload[0].value}</p>
          <p style={{ color: '#42A5F5' }}>Percentage: {data.percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <section>
      <h2>Impact Metrics</h2>
      <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', marginTop: '-12px', marginBottom: '20px' }}>
        Counts and percentages based on survey response data
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
        {/* Implementation Likelihood */}
        <div className="chart-section">
          <h3>Implementation Likelihood (total)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={implementationData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="score"
                style={{ fontSize: '11px' }}
              />
              <YAxis
                label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft', offset: 5, style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#90CAF9" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Satisfaction Distribution */}
        <div className="chart-section">
          <h3>Satisfaction Rating (total)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={satisfactionData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="stars"
                style={{ fontSize: '11px' }}
              />
              <YAxis
                label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft', offset: 5, style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#BA68C8" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Knowledge Gain Distribution */}
        <div className="chart-section">
          <h3>Knowledge Gain (total)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={knowledgeData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="score"
                style={{ fontSize: '11px' }}
              />
              <YAxis
                label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft', offset: 5, style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#F48FB1" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <SatisfactionDriversAnalysis surveyData={surveyData} />

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
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>⭐</span>
            <strong style={{ color: '#1976D2' }}>Consistently High Impact:</strong> 97% likely to implement changes and 91% satisfaction rating remain steady across all years
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>📚</span>
            <strong style={{ color: '#1976D2' }}>Strong Correlations:</strong> Knowledge gained, satisfaction, and implementation intention are all very strongly correlated (p &lt; 0.001)
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🎓</span>
            <strong style={{ color: '#1976D2' }}>Knowledge by Attendee Type:</strong> Land managers/owners are more likely to have a higher knowledge gained rating than technical professionals
          </li>
        </ul>
      </div>
    </section>
  )
}
