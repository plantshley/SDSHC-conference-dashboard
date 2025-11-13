import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import TopicInterestHeatmap from './TopicInterestHeatmap'
import TopicEvolutionNetwork from './TopicEvolutionNetwork'
import { getTopicColor, darkenColor } from '../constants/topicColors'

export default function TopicsSection({ surveyData }) {
  // Count topic interests from Interest_Categories (semicolon-separated)
  const topicCounts = {}
  surveyData.forEach(row => {
    if (row.Interest_Categories) {
      const topics = row.Interest_Categories.split(';').map(t => t.trim())
      topics.forEach(topic => {
        if (topic && topic !== 'NA') {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1
        }
      })
    }
  })

  const totalResponses = surveyData.length

  const topicPopularityData = Object.entries(topicCounts)
    .map(([topic, count]) => ({
      topic,
      count,
      percentage: ((count / totalResponses) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    // Show all topics

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const topicColor = getTopicColor(data.topic, topicPopularityData.findIndex(t => t.topic === data.topic))
      const darkColor = darkenColor(topicColor)
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title" style={{ color: darkColor }}><strong>{data.topic}</strong></p>
          <p style={{ color: darkColor, fontWeight: 500 }}>{data.count} mentions ({data.percentage}%)</p>
          {data.topic === 'Other Topics' && (
            <p style={{ color: darkColor, fontSize: '11px', marginTop: '4px', fontStyle: 'italic', fontWeight: 400 }}>
              Includes gardening/urban ag, beginning farming/getting started, specialty crops & methods, etc.
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <section>
      <h2>Topic Trends & Interest</h2>
      <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#666', marginTop: '-12px', marginBottom: '20px' }}>
        Counts and percentages based on survey response data
      </p>

      <div className="chart-section">
        <h3>Topic Popularity</h3>
        <ResponsiveContainer width="100%" height={800}>
          <BarChart data={topicPopularityData} margin={{ top: 5, right: 30, left: 80, bottom: 40 }} layout="vertical" barSize={40} barCategoryGap={10}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              label={{ value: '% of Respondents', position: 'insideBottom', offset: -5 }}
              style={{ fontSize: '11px' }}
            />
            <YAxis
              type="category"
              dataKey="topic"
              width={250}
              style={{ fontSize: '13px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="percentage" name="Interest Level">
              {topicPopularityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getTopicColor(entry.topic, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <TopicInterestHeatmap surveyData={surveyData} />

      <TopicEvolutionNetwork surveyData={surveyData} />

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
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>🔄</span>
            <strong style={{ color: '#1976D2' }}>Shifting Priorities:</strong> Livestock integration & cover crops dominated 2022-23, but interest now distributed more evenly across topics
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>📈</span>
            <strong style={{ color: '#1976D2' }}>Trending Up:</strong> Regenerative ag, nutrient management, and health connections showing significant growth over 4 years
          </li>
          <li style={{ marginBottom: '16px', paddingLeft: '32px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, fontSize: '22px' }}>👔</span>
            <strong style={{ color: '#1976D2' }}>Audience Preferences:</strong> Professionals seek economics & financial topics, while producers/educators focus on field practices like cover crops
          </li>
        </ul>
      </div>
    </section>
  )
}
