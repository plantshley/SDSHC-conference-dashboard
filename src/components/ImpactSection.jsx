import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from 'recharts'
import SatisfactionDriversAnalysis from './SatisfactionDriversAnalysis'

const COLORS = ['#90CAF9', '#BA68C8', '#F48FB1', '#9FA8DA', '#CE93D8', '#FF80AB', '#81D4FA']

export default function ImpactSection({ surveyData }) {
  // Implementation likelihood distribution
  const implementationCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
  surveyData.forEach(row => {
    if (row.Likelihood_Score && row.Likelihood_Score >= 1 && row.Likelihood_Score <= 4) {
      implementationCounts[row.Likelihood_Score]++
    }
  })

  const implementationData = Object.entries(implementationCounts).map(([score, count]) => ({
    score: `${score} - ${{ 1: 'Unlikely', 2: 'Maybe', 3: 'Likely', 4: 'Very Likely' }[score]}`,
    count
  }))

  // Satisfaction distribution
  const satisfactionCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  surveyData.forEach(row => {
    if (row.Satisfaction_Rating && row.Satisfaction_Rating >= 1 && row.Satisfaction_Rating <= 5) {
      satisfactionCounts[row.Satisfaction_Rating]++
    }
  })

  const satisfactionData = Object.entries(satisfactionCounts).map(([stars, count]) => ({
    stars: `${stars} ${stars === '1' ? 'Star' : 'Stars'}`,
    count
  }))

  // Knowledge gain distribution
  const knowledgeCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
  surveyData.forEach(row => {
    if (row.Knowledge_Gain_Rating && row.Knowledge_Gain_Rating >= 1 && row.Knowledge_Gain_Rating <= 4) {
      knowledgeCounts[row.Knowledge_Gain_Rating]++
    }
  })

  const knowledgeData = Object.entries(knowledgeCounts).map(([score, count]) => ({
    score: `${score} - ${{ 1: 'Little', 2: 'Some', 3: 'Good', 4: 'Excellent' }[score]}`,
    count
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
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.score || payload[0].payload.stars}</strong></p>
          <p style={{ color: '#42A5F5' }}>Count: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <section>
      <h2>Impact Metrics</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Implementation Likelihood */}
        <div className="chart-section">
          <h3>Implementation Likelihood</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={implementationData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="score"
                angle={-15}
                textAnchor="end"
                height={80}
                style={{ fontSize: '11px' }}
              />
              <YAxis
                label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#90CAF9" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Satisfaction Distribution */}
        <div className="chart-section">
          <h3>Satisfaction Rating Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={satisfactionData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="stars"
                style={{ fontSize: '11px' }}
              />
              <YAxis
                label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#BA68C8" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Knowledge Gain Distribution */}
        <div className="chart-section">
          <h3>Knowledge Gain Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={knowledgeData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="score"
                angle={-15}
                textAnchor="end"
                height={80}
                style={{ fontSize: '11px' }}
              />
              <YAxis
                label={{ value: 'Number of Responses', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#F48FB1" name="Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Satisfaction vs Knowledge Scatter */}
        <div className="chart-section">
          <h3>Satisfaction vs Knowledge Gain</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
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
                label={{ value: 'Knowledge Gain (1-4)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              <Scatter name="Responses" data={scatterData} fill="#9FA8DA" fillOpacity={0.6} />
            </ScatterChart>
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
            <strong style={{ color: '#1976D2' }}>Consistently High Impact:</strong> 97% likely to implement changes and 91% satisfaction rating remain steady across all years
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
            <strong style={{ color: '#1976D2' }}>Strong Correlations:</strong> Knowledge gained, satisfaction, and implementation intention are all very strongly correlated (p &lt; 0.001)
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
            <strong style={{ color: '#1976D2' }}>Opportunity for Advancement:</strong> Knowledge ratings moderate (85%), suggesting opportunity for deeper, more advanced content
          </li>
        </ul>
      </div>
    </section>
  )
}
