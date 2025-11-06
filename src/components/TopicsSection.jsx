import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import TopicInterestHeatmap from './TopicInterestHeatmap'

const COLORS = ['#90CAF9', '#BA68C8', '#F48FB1', '#9FA8DA', '#CE93D8', '#FF80AB', '#81D4FA', '#5C6BC0']

export default function TopicsSection({ surveyData }) {
  // Count topic interests from Interest_Categories (semicolon-separated)
  const topicCounts = {}
  surveyData.forEach(row => {
    if (row.Interest_Categories) {
      const topics = row.Interest_Categories.split(';').map(t => t.trim())
      topics.forEach(topic => {
        if (topic) {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1
        }
      })
    }
  })

  const topicPopularityData = Object.entries(topicCounts)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 topics

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.topic}</strong></p>
          <p style={{ color: '#42A5F5' }}>Interest: {payload[0].value} responses</p>
        </div>
      )
    }
    return null
  }

  return (
    <section>
      <h2>Topic Trends & Interest</h2>

      <div className="chart-section">
        <h3>Topic Popularity</h3>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={topicPopularityData} margin={{ top: 5, right: 30, left: 70, bottom: 40 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              label={{ value: 'Number of Interested Respondents', position: 'insideBottom', offset: -5 }}
              style={{ fontSize: '11px' }}
            />
            <YAxis
              type="category"
              dataKey="topic"
              width={150}
              style={{ fontSize: '11px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Interest Level">
              {topicPopularityData.map((entry, index) => (
                <Bar key={index} dataKey="count" fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <TopicInterestHeatmap surveyData={surveyData} />

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
            <strong style={{ color: '#1976D2' }}>Shifting Priorities:</strong> Livestock integration & cover crops dominated 2022-23, but interest now distributed more evenly across topics
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
            <strong style={{ color: '#1976D2' }}>Trending Up:</strong> Regenerative ag, nutrient management, and health connections showing significant growth over 4 years
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
            <strong style={{ color: '#1976D2' }}>Audience Preferences:</strong> Professionals seek economics & financial topics, while producers/educators focus on field practices like cover crops
          </li>
        </ul>
      </div>
    </section>
  )
}
