import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const COLORS = {
  'Agricultural Producers': '#90CAF9',
  'Conservation Professionals': '#BA68C8',
  'Students & Educators': '#F48FB1',
  'Land Managers & Owners': '#9FA8DA',
  'Technical Professionals': '#CE93D8',
  'Industry/Commercial': '#FF80AB',
  'Other Professionals': '#81D4FA',
  'Other': '#5C6BC0'
}

const LIKELIHOOD_COLORS = {
  1: '#FFCDD2',  // Unlikely - light red
  2: '#FFF9C4',  // Maybe - light yellow
  3: '#C5E1A5',  // Likely - light green
  4: '#81C784'   // Very Likely - green
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

  const detailedFlowData = Object.entries(fullFlowData)
    .map(([type, likelihood]) => ({
      type: type.length > 20 ? type.substring(0, 20) + '...' : type,
      fullType: type,
      unlikely: likelihood[1] || 0,
      maybe: likelihood[2] || 0,
      likely: likelihood[3] || 0,
      veryLikely: likelihood[4] || 0
    }))
    .sort((a, b) => (b.likely + b.veryLikely) - (a.likely + a.veryLikely))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-title"><strong>{payload[0].payload.fullType || payload[0].payload.type || payload[0].payload.likelihood}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Step 1: Interest by Attendee Type */}
        <div className="chart-section">
          <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Technician Interest by Attendee Type</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={interestByTypeData} margin={{ top: 5, right: 30, left: 120, bottom: 20 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" style={{ fontSize: '11px' }} />
              <YAxis
                type="category"
                dataKey="type"
                width={110}
                style={{ fontSize: '10px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
              <Bar dataKey="interested" stackId="a" fill="#81C784" name="Interested (Score 3+)" />
              <Bar dataKey="notInterested" stackId="a" fill="#E0E0E0" name="Not Interested" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Step 2: Implementation Likelihood Among Interested */}
        <div className="chart-section">
          <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Implementation Likelihood (Among Interested)</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={likelihoodData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="likelihood" style={{ fontSize: '11px' }} />
              <YAxis
                label={{ value: 'Number of Respondents', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                style={{ fontSize: '11px' }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Respondents">
                {likelihoodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={LIKELIHOOD_COLORS[entry.score]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Step 3: Detailed Flow - Type to Likelihood (for interested respondents) */}
      <div className="chart-section">
        <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Detailed Flow: Interested Attendees by Type & Implementation Likelihood</h4>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={detailedFlowData} margin={{ top: 5, right: 30, left: 120, bottom: 20 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" style={{ fontSize: '11px' }} />
            <YAxis
              type="category"
              dataKey="type"
              width={110}
              style={{ fontSize: '10px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 600 }} />
            <Bar dataKey="veryLikely" stackId="a" fill="#81C784" name="Very Likely" />
            <Bar dataKey="likely" stackId="a" fill="#C5E1A5" name="Likely" />
            <Bar dataKey="maybe" stackId="a" fill="#FFF9C4" name="Maybe" />
            <Bar dataKey="unlikely" stackId="a" fill="#FFCDD2" name="Unlikely" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: '#f5f7fa',
        borderRadius: '8px',
        fontSize: '13px'
      }}>
        <strong>Key Findings:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Agricultural Producers and Land Managers/Owners show highest interest in technician assistance</li>
          <li>Among interested respondents, the majority are "Likely" or "Very Likely" to implement changes</li>
          <li>This suggests the technician program could be highly effective for these priority groups</li>
        </ul>
      </div>
    </div>
  )
}
