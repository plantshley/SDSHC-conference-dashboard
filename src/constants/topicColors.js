// Shared topic color mapping across all visualizations
// Colors match the International Reach pie chart progression
export const TOPIC_COLORS = {
  'Other Topics': '#87CEEB',               // Sky blue
  'Livestock Integration & Grazing': '#6A5ACD',  // Slate blue
  'Cover Crops': '#9370DB',                // Medium purple (same as India in pie chart)
  'Soil Biology & Microbiology': '#BA55D3', // Medium orchid
  'Economics & Financial': '#DA70D6',      // Orchid
  'Regenerative & Organic Ag': '#EE82EE',  // Violet
  'Nutrient Management': '#FF69B4',        // Hot pink
  'No-Till & Reduced Tillage': '#FF1493',  // Deep pink
  'Soil Challenges': '#FF6347',            // Tomato red
  'Diverse Cropping Systems': '#FA8072',   // Salmon
  'Producer Case Studies & Stories': '#FA8072', // Salmon
  'Water Management': '#FA8072',           // Salmon
  'Carbon & Climate': '#F0E68C',           // Khaki (yellow - Egypt)
  'Health Connections': '#F0E68C',         // Khaki (yellow - Egypt)
  'Compost & Amendments': '#FFB347',       // Orange (Nicaragua - same as "Other" attendee type)
  'Soil Testing & Monitoring': '#9ACD32'   // Yellow green
}

// Fallback colors matching International Reach pie chart exactly
export const FALLBACK_COLORS = [
  '#87CEEB',  // Sky blue
  '#6A5ACD',  // Slate blue
  '#9370DB',  // Medium purple
  '#BA55D3',  // Medium orchid
  '#DA70D6',  // Orchid
  '#EE82EE',  // Violet
  '#FF69B4',  // Hot pink
  '#FF1493',  // Deep pink
  '#FF6347',  // Tomato
  '#FA8072',  // Salmon
  '#FFB347',  // Orange
  '#F0E68C',  // Khaki
  '#9ACD32',  // Yellow green
  '#90EE90',  // Light green
  '#00FA9A'   // Medium spring green
]

// Helper function to darken a hex color
export const darkenColor = (hex, percent = 30) => {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)))
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - percent / 100)))
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - percent / 100)))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

// Get color for a topic
export const getTopicColor = (topic, index = 0) => {
  return TOPIC_COLORS[topic] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
}
