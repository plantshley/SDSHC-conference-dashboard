import { useState } from 'react'
import { getTopicColor } from '../constants/topicColors'
import './TopicEvolutionNetwork.css'

export default function TopicEvolutionNetwork({ surveyData }) {
  const [selectedYear, setSelectedYear] = useState('all')
  const [hoveredNode, setHoveredNode] = useState(null)
  const width = 1100
  const height = 700

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
        const topics = row.Interest_Categories.split(';').map(t => t.trim()).filter(t => t && t !== 'NA')

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

    // Create nodes (all topics with mentions)
    const minMentions = 1
    const nodes = Object.entries(topicCounts)
      .filter(([_, count]) => count >= minMentions)
      .map(([topic, count]) => ({
        id: topic,
        count,
        label: topic.length > 20 ? topic.substring(0, 20) + '...' : topic
      }))
      .sort((a, b) => b.count - a.count)
      // Show all topics

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
    const spacingX = (width - 150) / (cols + 1)
    const spacingY = (height - 100) / (Math.ceil(rawNodes.length / cols) + 1)

    return {
      ...node,
      x: 75 + spacingX * (col + 1),
      y: 50 + spacingY * (row + 1)
    }
  })

  // Get node radius based on count
  const getNodeRadius = (count) => {
    if (nodes.length === 0) return 30
    const maxCount = Math.max(...nodes.map(n => n.count))
    return 20 + (count / maxCount) * 25
  }

  // Get edge width based on co-occurrence count
  const getEdgeWidth = (count) => {
    const maxCount = Math.max(...edges.map(e => e.count), 1)
    return 1 + (count / maxCount) * 8
  }

  // Get edge color - grey gradient based on strength
  const getEdgeColor = (count) => {
    const maxCount = Math.max(...edges.map(e => e.count), 1)
    const intensity = count / maxCount
    // From light grey (#ddd) to dark grey (#666) based on strength
    const greyValue = Math.round(221 - (221 - 102) * intensity)
    return `rgb(${greyValue}, ${greyValue}, ${greyValue})`
  }

  const years = ['all', ...new Set(surveyData.map(row => String(row.year)).filter(y => y && y !== 'null'))].sort()

  return (
    <div className="chart-section" style={{ marginTop: '24px' }}>
      <h3>Topic Evolution Network</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Shows which topics are mentioned together. Node size represents topic frequency, edge thickness shows co-mention strength.
      </p>

      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {years.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`year-filter-btn ${selectedYear === year ? 'active' : ''}`}
          >
            <div className="year-filter-btn-inner">
              {year === 'all' ? 'All Years' : year}
              <div className="year-filter-btn-shine" />
            </div>
          </button>
        ))}
      </div>

      {nodes.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          No sufficient topic co-occurrence data for selected year
        </div>
      ) : (
        <div style={{ position: 'relative', overflow: 'visible', display: 'flex', justifyContent: 'center' }}>
          {hoveredNode && (
            <div style={{
              position: 'absolute',
              top: `${(hoveredNode.y - 120) * (520 / 520) - 80}px`,
              left: `50%`,
              transform: `translateX(calc(-50% + ${hoveredNode.x - (width / 2)}px))`,
              background: 'white',
              padding: '10px 14px',
              borderRadius: '6px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              border: '1px solid #e0e0e0',
              pointerEvents: 'none',
              zIndex: 1000,
              fontSize: '13px',
              fontWeight: 600,
              maxWidth: '320px',
              whiteSpace: 'normal'
            }}>
              <div style={{ marginBottom: '4px', color: '#333', fontWeight: 600 }}>{hoveredNode.id}</div>
              <div style={{ color: '#666', fontSize: '12px', fontWeight: 400 }}>{hoveredNode.count} mentions</div>
              {hoveredNode.id === 'Other Topics' && (
                <div style={{ color: '#666', fontSize: '11px', marginTop: '6px', fontStyle: 'italic', fontWeight: 400, lineHeight: '1.4' }}>
                  Includes gardening/urban ag, beginning farming/getting started, specialty crops & methods, etc.
                </div>
              )}
            </div>
          )}
          <svg
            width={width}
            height={520}
            viewBox="0 120 1100 520"
            style={{ background: 'white', borderRadius: '8px' }}
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
                    stroke={getEdgeColor(edge.count)}
                    strokeWidth={getEdgeWidth(edge.count)}
                    opacity={0.7}
                  >
                    <title>{`${edge.source} & ${edge.target}: ${edge.count} co-occurrences`}</title>
                  </line>
                )
              })}
            </g>

            {/* Draw nodes */}
            <g>
              {nodes.map((node, i) => {
                const radius = getNodeRadius(node.count)
                const color = getTopicColor(node.id, i)

                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius}
                      fill={color}
                      opacity={0.85}
                      stroke="white"
                      strokeWidth={3}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="16px"
                      fontWeight="700"
                      fill="white"
                      pointerEvents="none"
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
                return (
                  <g key={`label-${node.id}`}>
                    <text
                      x={node.x}
                      y={node.y + radius + 16}
                      textAnchor="middle"
                      fontSize="11px"
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

      <div style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
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
