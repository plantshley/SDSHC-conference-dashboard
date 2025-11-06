import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import './App.css'
import StatsCard from './components/StatsCard'
import NavButton from './components/NavButton'
import OverviewSection from './components/OverviewSection'
import DemographicsSection from './components/DemographicsSection'
import ImpactSection from './components/ImpactSection'
import TopicsSection from './components/TopicsSection'
import TechnicianSection from './components/TechnicianSection'
import GeographySection from './components/GeographySection'

function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [surveyData, setSurveyData] = useState([])
  const [geoStateOverall, setGeoStateOverall] = useState([])
  const [geoStateByEvent, setGeoStateByEvent] = useState([])
  const [geoCityOverall, setGeoCityOverall] = useState([])
  const [geoCityByEvent, setGeoCityByEvent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      const [survey, stateOverall, stateByEvent, cityOverall, cityByEvent] = await Promise.all([
        loadCSV(import.meta.env.BASE_URL + 'soil_health_survey_enhanced.csv'),
        loadCSV(import.meta.env.BASE_URL + 'arcgis_state_overall.csv'),
        loadCSV(import.meta.env.BASE_URL + 'arcgis_state_by_event.csv'),
        loadCSV(import.meta.env.BASE_URL + 'arcgis_city_overall.csv'),
        loadCSV(import.meta.env.BASE_URL + 'arcgis_city_by_event.csv'),
      ])

      console.log('Survey data loaded:', survey.length, 'rows')
      console.log('Sample survey row:', survey[0])
      console.log('Sample columns:', Object.keys(survey[0] || {}))

      setSurveyData(survey)
      setGeoStateOverall(stateOverall)
      setGeoStateByEvent(stateByEvent)
      setGeoCityOverall(cityOverall)
      setGeoCityByEvent(cityByEvent)
      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const loadCSV = (path) => {
    return new Promise((resolve, reject) => {
      Papa.parse(path, {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      })
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading conference data...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>South Dakota Soil Health Coalition</h1>
            <p className="subtitle">Annual Conference Impact Dashboard (2022-2025)</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontStyle: 'italic', opacity: 0.9 }}>
              Cultivating Knowledge, Growing Change
            </p>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <section style={{ background: 'white', padding: '40px 0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
        <div className="dashboard-content">
          <div className="stats-grid">
            <StatsCard
              title="Likely to Implement"
              value="97%"
              subtitle="278 of 287 respondents"
              icon="🌱"
              highlighted={true}
            />
            <StatsCard
              title="High Satisfaction"
              value="91%"
              subtitle="291 of 319 responses"
              icon="⭐"
              highlighted={true}
            />
            <StatsCard
              title="Total Registrations"
              value="1,307+"
              subtitle="2022-2025"
              icon="🎟️"
            />
            <StatsCard
              title="Knowledge Gain"
              value="85%"
              subtitle="270 of 319 responses"
              icon="📚"
            />
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav style={{
        background: '#f5f7fa',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          maxWidth: '2000px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '0 60px'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'demographics', label: 'Demographics' },
            { id: 'impact', label: 'Impact Metrics' },
            { id: 'topics', label: 'Topic Trends' },
            { id: 'technician', label: 'Technician Program' },
            { id: 'geography', label: 'Geographic Reach' }
          ].map(tab => (
            <NavButton
              key={tab.id}
              label={tab.label}
              active={activeSection === tab.id}
              onClick={() => setActiveSection(tab.id)}
            />
          ))}
        </div>
      </nav>

      {/* Content Sections */}
      <div className="dashboard-content">
        {activeSection === 'overview' && <OverviewSection surveyData={surveyData} />}
        {activeSection === 'demographics' && <DemographicsSection surveyData={surveyData} />}
        {activeSection === 'impact' && <ImpactSection surveyData={surveyData} />}
        {activeSection === 'topics' && <TopicsSection surveyData={surveyData} />}
        {activeSection === 'technician' && <TechnicianSection surveyData={surveyData} />}
        {activeSection === 'geography' && (
          <GeographySection
            geoStateOverall={geoStateOverall}
            geoStateByEvent={geoStateByEvent}
            geoCityOverall={geoCityOverall}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>&copy; 2025 South Dakota Soil Health Coalition | Dashboard built with conference survey data (2022-2025)</p>
        <p>For more information: <a href="https://www.sdsoilhealthcoalition.org">sdsoilhealthcoalition.org</a> | Contact: sdsoilhealth@gmail.com</p>
      </footer>
    </div>
  )
}

export default App
