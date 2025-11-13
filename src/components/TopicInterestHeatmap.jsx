export default function TopicInterestHeatmap({ surveyData }) {
  // Build heatmap data: topics x attendee types
  const topicsByType = {}
  const allTopics = new Set()
  const allTypes = new Set()
  const typeTotals = {}

  surveyData.forEach(row => {
    if (row.Attendee_Type_Category && row.Interest_Categories) {
      const type = row.Attendee_Type_Category
      const topics = row.Interest_Categories.split(';').map(t => t.trim()).filter(t => t && t !== 'NA')

      allTypes.add(type)
      typeTotals[type] = (typeTotals[type] || 0) + 1

      topics.forEach(topic => {
        allTopics.add(topic)
        const key = `${topic}|${type}`
        topicsByType[key] = (topicsByType[key] || 0) + 1
      })
    }
  })

  // Get all topics sorted by total frequency
  const topicCounts = {}
  Object.keys(topicsByType).forEach(key => {
    const [topic] = key.split('|')
    topicCounts[topic] = (topicCounts[topic] || 0) + topicsByType[key]
  })

  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([topic]) => topic)

  const types = Array.from(allTypes).filter(type => type !== 'Unknown').sort()

  // Create heatmap matrix with percentages
  const heatmapData = topTopics.map(topic => {
    const row = { topic }
    types.forEach(type => {
      const key = `${topic}|${type}`
      const count = topicsByType[key] || 0
      const percentage = typeTotals[type] ? ((count / typeTotals[type]) * 100).toFixed(1) : 0
      row[type] = { count, percentage }
    })
    return row
  })

  // Find max percentage for color scaling
  const maxPercentage = Math.max(...topTopics.flatMap(topic =>
    types.map(type => {
      const key = `${topic}|${type}`
      const count = topicsByType[key] || 0
      return typeTotals[type] ? (count / typeTotals[type]) * 100 : 0
    })
  ))

  // Color intensity function - pink to blue gradient
  const getColor = (percentage) => {
    if (!percentage || percentage === 0) return '#f5f5f5'
    const intensity = percentage / maxPercentage
    // From light pink (#FFC0CB) to blue (#4682B4)
    const r = Math.round(255 - (255 - 70) * intensity)
    const g = Math.round(192 - (192 - 130) * intensity)
    const b = Math.round(203 - (203 - 180) * intensity)
    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div className="chart-section" style={{ marginTop: '24px' }}>
      <h3>Topic Interest Heatmap</h3>
      <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
        Values represent percentage of each attendee type interested in each topic. Darker shades indicate higher interest levels.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          minWidth: '800px',
          tableLayout: 'fixed',
          background: 'white'
        }}>
          <thead>
            <tr>
              <th style={{
                padding: '12px 8px',
                textAlign: 'left',
                borderBottom: '1px solid white',
                fontWeight: 600,
                width: '180px',
                position: 'sticky',
                left: 0,
                background: 'white',
                zIndex: 10
              }}>Topic</th>
              {types.map(type => {
                // Split long type names into multiple lines
                const words = type.split(' ')
                const lines = []
                let currentLine = ''

                words.forEach(word => {
                  if ((currentLine + ' ' + word).length > 12 && currentLine) {
                    lines.push(currentLine)
                    currentLine = word
                  } else {
                    currentLine = currentLine ? currentLine + ' ' + word : word
                  }
                })
                if (currentLine) lines.push(currentLine)

                return (
                  <th key={type} style={{
                    padding: '12px 8px',
                    textAlign: 'center',
                    borderBottom: '1px solid white',
                    fontWeight: 600,
                    width: `${100 / (types.length + 1)}%`
                  }}>
                    {lines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td style={{
                  padding: '12px 8px',
                  borderBottom: '1px solid white',
                  fontWeight: 500,
                  position: 'sticky',
                  left: 0,
                  background: 'white',
                  zIndex: 5,
                  height: '44px',
                  maxHeight: '44px',
                  lineHeight: '20px',
                  overflow: 'hidden',
                  verticalAlign: 'middle'
                }}>{row.topic}</td>
                {types.map(type => {
                  const cellData = row[type]
                  const percentage = parseFloat(cellData.percentage)
                  return (
                    <td key={type} style={{
                      padding: '12px 8px',
                      borderBottom: '1px solid white',
                      textAlign: 'center',
                      background: getColor(percentage),
                      color: percentage > maxPercentage * 0.5 ? 'white' : '#333',
                      fontWeight: percentage > maxPercentage * 0.5 ? 600 : 400,
                      height: '44px',
                      maxHeight: '44px',
                      lineHeight: '20px',
                      verticalAlign: 'middle'
                    }}>
                      {percentage > 0 ? `${cellData.percentage}%` : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
