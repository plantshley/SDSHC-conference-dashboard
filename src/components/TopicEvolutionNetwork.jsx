import { useState, useEffect, useRef } from 'react'

const COLORS = ['#87CEEB', '#6A5ACD', '#9370DB', '#BA55D3', '#DA70D6', '#EE82EE', '#FF69B4', '#FF1493', '#FF6347', '#FA8072', '#FFB347', '#F0E68C', '#9ACD32', '#90EE90', '#00FA9A']

export default function TopicEvolutionNetwork({ surveyData }) {
  const [selectedYear, setSelectedYear] = useState('all')
  const width = 800
  const height = 500

  // Extract topic co-occurrences
  const getTopicData = () => {
    const filteredData = selectedYear === 'all'
      ? surveyData
      : surveyData.filter(row => String(row.year) === selectedYear)

    // Count individual topic frequencies
    const topicCounts = {}
    const coOccurrences = {}

    filteredData.forEach(row => {
      if (row.Interest_Categories) {
        const topics = row.Interest_Categories.split(';').map(t => t.trim()).filter(t => t)

        // Count individual topics
        topics.forEach(topic => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1
        })

        // Count co-occurrences
        for (let i = 0; i < topics.length; i++) {
          for (let j = i + 1; j < topics.length; j++) {
            const pair = [topics[i], topics[j]].sort().join('|||')
            coOccurrences[pair] = (coOccurrences[pair] || 0) + 1
          }
        }
      }
    })

    // Create nodes (topics with significant mentions)
    const minMentions = 5
    const nodes = Object.entries(topicCounts)
      .filter(([_, count]) => count >= minMentions)
      .map(([topic, count]) => ({
        id: topic,
        count,
        label: topic.length > 20 ? topic.substring(0, 20) + '...' : topic
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12) // Top 12 topics for better spacing

    const topicSet = new Set(nodes.map(n => n.id))

    // Create edges (connections between topics)
    const edges = Object.entries(coOccurrences)
      .filter(([pair, _]) => {
        const [topic1, topic2] = pair.split('|||')
        return topicSet.has(topic1) && topicSet.has(topic2)
      })
      .map(([pair, count]) => {
        const [source, target] = pair.split('|||')
        return { source, target, count }
      })
      .filter(edge => edge.count >= 2) // Minimum 2 co-occurrences

    return { nodes, edges, topicCounts }
  }

  const { nodes: rawNodes, edges } = getTopicData()

  // Position nodes in a simple grid layout
  const nodes = rawNodes.map((node, i) => {
    const cols = Math.ceil(Math.sqrt(rawNodes.length))
    const row = Math.floor(i / cols)
    const col = i % cols
    const spacingX = (width - 200) / (cols + 1)
    const spacingY = (height - 150) / (Math.ceil(rawNodes.length / cols) + 1)

    return {
      ...node,
      x: 100 + spacingX * (col + 1),
      y: 75 + spacingY * (row + 1)
    }
  })

  // Get node radius based on count
  const getNodeRadius = (count) => {
    if (nodes.length === 0) return 20
    const maxCount = Math.max(...nodes.map(n => n.count))
    return 12 + (count / maxCount) * 18
  }

  // Get edge width based on co-occurrence count
  const getEdgeWidth = (count) => {
    const maxCount = Math.max(...edges.map(e => e.count), 1)
    return 1 + (count / maxCount) * 4
  }

  const years = ['all', ...new Set(surveyData.map(row => String(row.year)).filter(y => y))].sort()

  return (
    <div className="chart-section" style={{ marginTop: '24px' }}>
      <h3>Topic Evolution Network</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Shows which topics are mentioned together. Node size represents topic frequency, edge thickness shows co-mention strength.
      </p>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ marginRight: '8px', fontWeight: 600 }}>Filter by Year:</label>
        {years.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            style={{
              padding: '8px 16px',
              margin: '4px',
              background: selectedYear === year ? '#6A5ACD' : '#f5f5f5',
              color: selectedYear === year ? 'white' : '#333',
              border: selectedYear === year ? '2px solid #6A5ACD' : '2px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: selectedYear === year ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {year === 'all' ? 'All Years' : year}
          </button>
        ))}
      </div>

      {nodes.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          No sufficient topic co-occurrence data for selected year
        </div>
      ) : (
        <div style={{ position: 'relative', overflow: 'visible' }}>
          <svg
            width={width}
            height={height}
            style={{ border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white' }}
          >
            {/* Draw edges */}
            <g>
              {edges.map((edge, i) => {
                const source = nodes.find(n => n.id === edge.source)
                const target = nodes.find(n => n.id === edge.target)
                if (!source || !target) return null

                return (
                  <line
                    key={i}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="#ccc"
                    strokeWidth={getEdgeWidth(edge.count)}
                    opacity={0.6}
                  />
                )
              })}
            </g>

            {/* Draw nodes */}
            <g>
              {nodes.map((node, i) => {
                const radius = getNodeRadius(node.count)
                const color = COLORS[i % COLORS.length]

                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={color}
                      opacity={0.8}
                      stroke="white"
                      strokeWidth={2}
                    >
                      <title>{`${node.id}: ${node.count} mentions`}</title>
                    </circle>
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="10px"
                      fontWeight="600"
                      fill="white"
                      pointerEvents="none"
                      style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {node.count}
                    </text>
                  </g>
                )
              })}
            </g>

            {/* Draw labels */}
            <g>
              {nodes.map((node) => {
                const radius = getNodeRadius(node.count)
                const labelWidth = node.label.length * 6 + 8
                return (
                  <g key={`label-${node.id}`}>
                    {/* White background for better readability */}
                    <rect
                      x={node.x - labelWidth / 2}
                      y={node.y + radius + 3}
                      width={labelWidth}
                      height={16}
                      fill="white"
                      fillOpacity={0.95}
                      rx={3}
                    />
                    <text
                      x={node.x}
                      y={node.y + radius + 14}
                      textAnchor="middle"
                      fontSize="10px"
                      fontWeight="600"
                      fill="#333"
                    >
                      {node.label}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </div>
      )}

      <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
        <p style={{ fontSize: '13px', margin: '4px 0' }}>
          <strong>How to read:</strong> Each circle represents a topic (size = frequency).
          Lines connect topics mentioned together by attendees (thickness = co-mention frequency).
        </p>
        <p style={{ fontSize: '13px', margin: '4px 0' }}>
          <strong>Insights:</strong> Clustered topics reveal themes (e.g., livestock + cover crops).
          Isolated topics suggest unique interests. Filter by year to see evolving connections.
        </p>
      </div>
    </div>
  )
}
