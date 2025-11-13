import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// City coordinates lookup for South Dakota and surrounding areas
const cityCoordinates = {
  // South Dakota cities
  'Brookings': { lat: 44.3114, lng: -96.7984, state: 'SD' },
  'Wentworth': { lat: 43.9933, lng: -97.0948, state: 'SD' },
  'LaBolt': { lat: 45.0841, lng: -96.6678, state: 'SD' },
  'Webster': { lat: 45.3330, lng: -97.5201, state: 'SD' },
  'Clear Lake': { lat: 44.7505, lng: -96.6859, state: 'SD' },
  'Sioux Falls': { lat: 43.5460, lng: -96.7313, state: 'SD' },
  'Oacoma': { lat: 43.7936, lng: -99.3701, state: 'SD' },
  'Revillo': { lat: 45.0130, lng: -96.5892, state: 'SD' },
  'Salem': { lat: 43.7244, lng: -97.3898, state: 'SD' },
  'Watertown': { lat: 44.8997, lng: -97.1151, state: 'SD' },
  'Rapid City': { lat: 44.0805, lng: -103.2310, state: 'SD' },
  'Gettysburg': { lat: 45.0119, lng: -99.9548, state: 'SD' },
  'Pierre': { lat: 44.3683, lng: -100.3510, state: 'SD' },
  'Aberdeen': { lat: 45.4647, lng: -98.4865, state: 'SD' },
  'Mitchell': { lat: 43.7094, lng: -98.0298, state: 'SD' },
  'Yankton': { lat: 42.8711, lng: -97.3973, state: 'SD' },
  'Vermillion': { lat: 42.7794, lng: -96.9292, state: 'SD' },
  'Huron': { lat: 44.3633, lng: -98.2142, state: 'SD' },
  'Spearfish': { lat: 44.4906, lng: -103.8591, state: 'SD' },
  'Brandon': { lat: 43.5944, lng: -96.5709, state: 'SD' },
  'Box Elder': { lat: 44.1111, lng: -103.0646, state: 'SD' },
  'Sturgis': { lat: 44.4097, lng: -103.5088, state: 'SD' },
  'Madison': { lat: 44.0061, lng: -97.1134, state: 'SD' },
  'Milbank': { lat: 45.2194, lng: -96.6317, state: 'SD' },
  'Dell Rapids': { lat: 43.8272, lng: -96.7092, state: 'SD' },
  'Canton': { lat: 43.3005, lng: -96.5920, state: 'SD' },
  'Chamberlain': { lat: 43.8075, lng: -99.3290, state: 'SD' },
  'Winner': { lat: 43.3769, lng: -99.8593, state: 'SD' },

  // Minnesota cities
  'Saint Paul': { lat: 44.9537, lng: -93.0900, state: 'MN' },
  'Minneapolis': { lat: 44.9778, lng: -93.2650, state: 'MN' },
  'Rochester': { lat: 44.0121, lng: -92.4802, state: 'MN' },
  'Duluth': { lat: 45.0000, lng: -92.1005, state: 'MN' },
  'Marshall': { lat: 44.4469, lng: -95.7886, state: 'MN' },
  'Mankato': { lat: 44.1636, lng: -93.9994, state: 'MN' },

  // Nebraska cities
  'Omaha': { lat: 41.2565, lng: -95.9345, state: 'NE' },
  'Lincoln': { lat: 40.8136, lng: -96.7026, state: 'NE' },
  'Norfolk': { lat: 42.0281, lng: -97.4170, state: 'NE' },

  // Missouri cities
  'St Louis': { lat: 38.6270, lng: -90.1994, state: 'MO' },
  'Kansas City': { lat: 39.0997, lng: -94.5786, state: 'MO' },
  'Columbia': { lat: 38.9517, lng: -92.3341, state: 'MO' },

  // Iowa cities
  'Des Moines': { lat: 41.6005, lng: -93.6091, state: 'IA' },
  'Cedar Rapids': { lat: 41.9779, lng: -91.6656, state: 'IA' },
  'Sioux City': { lat: 42.4999, lng: -96.4003, state: 'IA' },

  // North Dakota cities
  'Fargo': { lat: 46.8772, lng: -96.7898, state: 'ND' },
  'Bismarck': { lat: 46.8083, lng: -100.7837, state: 'ND' },
  'Grand Forks': { lat: 47.9253, lng: -97.0329, state: 'ND' },

  // Colorado
  'Denver': { lat: 39.7392, lng: -104.9903, state: 'CO' },
}

const MapView = ({ geoCityOverall }) => {
  // Center of South Dakota - adjusted to show entire state
  const center = [44.5, -100.0]
  const zoom = 6

  // Process city data - ONLY South Dakota cities
  const cityData = geoCityOverall
    .filter(row => row.City && row.City !== '' && row.State === 'SD' && cityCoordinates[row.City])
    .map(row => ({
      city: row.City,
      state: row.State,
      count: parseInt(row.Count),
      percentage: row.Percentage,
      ...cityCoordinates[row.City]
    }))

  // Single color for all bubbles - middle blue-purple
  const bubbleColor = '#9FA8DA'

  // Size based on count
  const getRadius = (count) => {
    return Math.min(Math.max(count / 3, 5), 25)
  }

  return (
    <div className="map-wrapper">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '450px', width: '100%', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {cityData.map((location, idx) => (
          <CircleMarker
            key={idx}
            center={[location.lat, location.lng]}
            radius={getRadius(location.count)}
            fillColor={bubbleColor}
            color="#fff"
            weight={2}
            opacity={0.9}
            fillOpacity={0.7}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1976D2' }}>{location.city}, {location.state}</h4>
                <p style={{ margin: '4px 0' }}><strong>Ticket Registrations:</strong> {location.count}</p>
                <p style={{ margin: '4px 0' }}><strong>Percentage:</strong> {location.percentage}%</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default MapView
