import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

// Attendee type colors from Demographics page
const ATTENDEE_TYPE_COLORS = {
  'Agricultural Producers': '#FF69B4',        // Belgium pink
  'Conservation Professionals': '#87CEEB',    // Canada blue
  'Industry/Commercial': '#6A5ACD',           // Czech Republic purple
  'Land Managers & Owners': '#F0E68C',        // Egypt yellow
  'Students & Educators': '#DA70D6',          // Ukraine purple
  'Technical Professionals': '#FF6347',       // Greece red
  'Other Professionals': '#FA8072',           // Hong Kong coral
  'Other': '#FFB347',                         // Hungary orange
  'Unknown': '#9370DB'                        // Fiji purple
}

// Helper function to lighten a hex color
const lightenColor = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * (percent / 100)))
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * (percent / 100)))
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * (percent / 100)))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

// Helper function to darken a hex color
const darkenColor = (hex, percent = 30) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)))
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

// Generate lighter shades for each attendee type
const getLikelihoodColor = (type, likelihood) => {
  const baseColor = ATTENDEE_TYPE_COLORS[type] || ATTENDEE_TYPE_COLORS['Other']
  switch(likelihood) {
    case 'veryLikely': return baseColor  // Original color
    case 'likely': return lightenColor(baseColor, 30)
    case 'maybe': return lightenColor(baseColor, 50)
    case 'unlikely': return lightenColor(baseColor, 70)
    default: return baseColor
  }
}

export default function TechnicianProgramPotential({ surveyData }) {
  // Calculate flows: Attendee Type -> Technician Interest -> Implementation Likelihood

  // Step 1: Group by Attendee Type and Technician Interest
  const typeInterestData = {}
  surveyData.forEach(row => {
    if (row.Attendee_Type_Category && row.Technician_Interest_Score !== null && row.Technician_Interest_Score !== undefined) {
      const type = row.Attendee_Type_Category
      const interested = row.Technician_Interest_Score >= 3  // 3+ considered interested

      if (!typeInterestData[type]) {
        typeInterestData[type] = { interested: 0, notInterested: 0 }
      }

      if (interested) {
        typeInterestData[type].interested++
      } else {
        typeInterestData[type].notInterested++
      }
    }
  })

  const interestByTypeData = Object.entries(typeInterestData)
    .map(([type, counts]) => ({
      type: type.length > 20 ? type.substring(0, 20) + '...' : type,
      fullType: type,
      interested: counts.interested,
      notInterested: counts.notInterested,
      total: counts.interested + counts.notInterested
    }))
    .sort((a, b) => b.interested - a.interested)

  // Step 2: Among interested, breakdown by implementation likelihood
  const interestedByLikelihood = { 1: 0, 2: 0, 3: 0, 4: 0 }
  surveyData.forEach(row => {
    if (row.Technician_Interest_Score >= 3 && row.Likelihood_Score) {
      interestedByLikelihood[row.Likelihood_Score] = (interestedByLikelihood[row.Likelihood_Score] || 0) + 1
    }
  })

  const likelihoodData = Object.entries(interestedByLikelihood).map(([score, count]) => ({
    likelihood: { 1: 'Unlikely', 2: 'Maybe', 3: 'Likely', 4: 'Very Likely' }[score],
    count,
    score: parseInt(score)
  }))

  // Step 3: Detailed breakdown by Type + Interest + Likelihood
  const fullFlowData = {}
  surveyData.forEach(row => {
    if (row.Attendee_Type_Category && row.Technician_Interest_Score >= 3 && row.Likelihood_Score) {
      const type = row.Attendee_Type_Category
      if (!fullFlowData[type]) {
        fullFlowData[type] = { 1: 0, 2: 0, 3: 0, 4: 0 }
      }
      fullFlowData[type][row.Likelihood_Score]++
    }
  })

  // Calculate total interested respondents for percentage calculation
  const totalInterested = surveyData.filter(row => row.Technician_Interest_Score >= 3).length

  const detailedFlowData = Object.entries(fullFlowData)
    .map(([type, likelihood]) => {
      const total = (likelihood[1] || 0) + (likelihood[2] || 0) + (likelihood[3] || 0) + (likelihood[4] || 0)
      return {
        type: type.length > 20 ? type.substring(0, 20) + '...' : type,
        fullType: type,
        unlikelyCount: likelihood[1] || 0,
        maybeCount: likelihood[2] || 0,
        likelyCount: likelihood[3] || 0,
        veryLikelyCount: likelihood[4] || 0,
        unlikely: ((likelihood[1] || 0) / totalInterested * 100).toFixed(1),
        maybe: ((likelihood[2] || 0) / totalInterested * 100).toFixed(1),
        likely: ((likelihood[3] || 0) / totalInterested * 100).toFixed(1),
        veryLikely: ((likelihood[4] || 0) / totalInterested * 100).toFixed(1)
      }
    })
    .sort((a, b) => (parseFloat(b.likely) + parseFloat(b.veryLikely)) - (parseFloat(a.likely) + parseFloat(a.veryLikely)))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const baseColor = ATTENDEE_TYPE_COLORS[data.fullType] || ATTENDEE_TYPE_COLORS['Other']
      const darkColor = darkenColor(baseColor)

      return (
        <div className="custom-tooltip">
          <p className="tooltip-title" style={{ color: darkColor }}><strong>{data.fullType || data.type || data.likelihood}</strong></p>
          {payload.map((entry, index) => {
            const countKey = `${entry.dataKey}Count`
            const count = data[countKey]
            return (
              <p key={index} style={{ color: darkColor, fontWeight: 500 }}>
                {entry.name}: {entry.value}% ({count})
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '16px' }}>Technician Program Potential Flow Analysis</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
        Flow analysis showing which attendee types are interested in technician assistance and their likelihood to implement changes.
      </p>

      {/* Detailed Flow - Type to Likelihood (for interested respondents) */}
      <div className="chart-section">
        <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Detailed Flow: Interested Attendees by Type & Implementation Likelihood</h4>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
          Colors represent attendee types, with lighter shades indicating lower implementation likelihood.
        </p>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={detailedFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 40 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              label={{ value: 'Percentage of all respondents interested in technician assistance (48% of all survey respondents)', position: 'insideBottom', offset: -10, style: { fontSize: '14px' } }}
              style={{ fontSize: '13px' }}
            />
            <YAxis
              type="category"
              dataKey="fullType"
              width={200}
              style={{ fontSize: '13px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={50}
              wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
            />
            <Bar dataKey="veryLikely" stackId="a" name="Very Likely" fill="#6A5ACD">
              {detailedFlowData.map((entry, index) => (
                <Cell key={`vl-${index}`} fill={getLikelihoodColor(entry.fullType, 'veryLikely')} />
              ))}
            </Bar>
            <Bar dataKey="likely" stackId="a" name="Likely" fill="#9B8FD1">
              {detailedFlowData.map((entry, index) => (
                <Cell key={`l-${index}`} fill={getLikelihoodColor(entry.fullType, 'likely')} />
              ))}
            </Bar>
            <Bar dataKey="maybe" stackId="a" name="Maybe" fill="#CDBDE8">
              {detailedFlowData.map((entry, index) => (
                <Cell key={`m-${index}`} fill={getLikelihoodColor(entry.fullType, 'maybe')} />
              ))}
            </Bar>
            <Bar dataKey="unlikely" stackId="a" name="Unlikely" fill="#E8E0F5">
              {detailedFlowData.map((entry, index) => (
                <Cell key={`u-${index}`} fill={getLikelihoodColor(entry.fullType, 'unlikely')} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
