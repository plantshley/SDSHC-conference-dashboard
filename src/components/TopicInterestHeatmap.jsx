export default function TopicInterestHeatmap({ surveyData }) {
  // Build heatmap data: topics x attendee types
  const topicsByType = {}
  const allTopics = new Set()
  const allTypes = new Set()

  surveyData.forEach(row => {
    if (row.Attendee_Type_Category && row.Interest_Categories) {
      const type = row.Attendee_Type_Category
      const topics = row.Interest_Categories.split(';').map(t => t.trim()).filter(t => t)

      allTypes.add(type)

      topics.forEach(topic => {
        allTopics.add(topic)
        const key = `${topic}|${type}`
        topicsByType[key] = (topicsByType[key] || 0) + 1
      })
    }
  })

  // Get top 12 topics by total frequency
  const topicCounts = {}
  Object.keys(topicsByType).forEach(key => {
    const [topic] = key.split('|')
    topicCounts[topic] = (topicCounts[topic] || 0) + topicsByType[key]
  })

  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([topic]) => topic)

  const types = Array.from(allTypes).sort()

  // Create heatmap matrix
  const heatmapData = topTopics.map(topic => {
    const row = { topic }
    types.forEach(type => {
      const key = `${topic}|${type}`
      row[type] = topicsByType[key] || 0
    })
    return row
  })

  // Find max value for color scaling
  const maxValue = Math.max(...Object.values(topicsByType))

  // Color intensity function
  const getColor = (value) => {
    if (!value) return '#f5f5f5'
    const intensity = value / maxValue
    const r = Math.round(144 + (66 - 144) * intensity)  // From #90CAF9 to darker blue
    const g = Math.round(202 + (68 - 202) * intensity)
    const b = Math.round(249 + (200 - 249) * intensity)
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div className="chart-section" style={{ marginTop: '24px' }}>
      <h3>Topic Interest Heatmap</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Topic interest frequency by attendee type. Darker colors indicate higher interest.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          minWidth: '800px'
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '12px 8px',
                textAlign: 'left',
                borderBottom: '2px solid #e0e0e0',
                fontWeight: 600,
                minWidth: '180px',
                position: 'sticky',
                left: 0,
                background: 'white',
                zIndex: 10
              }}>Topic</th>
              {types.map(type => (
                <th key={type} style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  borderBottom: '2px solid #e0e0e0',
                  fontWeight: 600,
                  minWidth: '100px'
                }}>
                  <div style={{ transform: 'rotate(-45deg)', transformOrigin: 'center', whiteSpace: 'nowrap' }}>
                    {type.length > 15 ? type.substring(0, 15) + '...' : type}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td style={{
                  padding: '12px 8px',
                  borderBottom: '1px solid #e0e0e0',
                  fontWeight: 500,
                  position: 'sticky',
                  left: 0,
                  background: 'white',
                  zIndex: 5
                }}>{row.topic}</td>
                {types.map(type => (
                  <td key={type} style={{
                    padding: '12px 8px',
                    borderBottom: '1px solid #e0e0e0',
                    textAlign: 'center',
                    background: getColor(row[type]),
                    color: row[type] > maxValue * 0.5 ? 'white' : '#333',
                    fontWeight: row[type] > maxValue * 0.5 ? 600 : 400
                  }}>
                    {row[type] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#f5f7fa',
        borderRadius: '8px',
        fontSize: '12px'
      }}>
        <strong>Legend:</strong> Values represent number of respondents interested in each topic by attendee type.
        Darker shades indicate higher interest levels.
      </div>
    </div>
  )
}
