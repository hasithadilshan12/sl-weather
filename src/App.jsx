import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [city, setCity] = useState('Colombo')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [aqi, setAqi] = useState(null)
  const [error, setError] = useState('')

  const API_KEY = '09607bb24161667ee9aee73113169c80'

  useEffect(() => {
    fetchWeather('Colombo')
  }, [])

  const fetchWeather = async (searchCity) => {
    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchCity},LK&appid=${API_KEY}&units=metric`)
      if (!weatherRes.ok) throw new Error('City not found. Please check spelling.')
      const weatherData = await weatherRes.json()
      setWeather(weatherData)

      const lat = weatherData.coord.lat
      const lon = weatherData.coord.lon

      const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
      const aqiData = await aqiRes.json()
      setAqi(aqiData.list[0])

      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${searchCity},LK&appid=${API_KEY}&units=metric`)
      const forecastData = await forecastRes.json()
      
      const dailyForecast = forecastData.list.filter(item => item.dt_txt.includes('12:00:00'))
      setForecast(dailyForecast)

      setError('')
    } catch (err) {
      setError(err.message)
      setWeather(null)
      setForecast(null)
      setAqi(null)
    }
  }

  const getAqiInfo = (index) => {
    switch(index) {
      case 1: return { text: 'Good', color: '#5be9ad' }
      case 2: return { text: 'Fair', color: '#a8ffd2' }
      case 3: return { text: 'Moderate', color: '#f1c40f' }
      case 4: return { text: 'Poor', color: '#e67e22' }
      case 5: return { text: 'Very Poor', color: '#e74c3c' }
      default: return { text: 'Unknown', color: '#fff' }
    }
  }

  return (
    <div className="dark-dashboard">
      <header className="header">
        <div className="logo">
          <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00daf3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
          </svg>
          <div>
            <h1>LankaWeather</h1>
          </div>
        </div>
        
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search Sri Lankan city..." 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchWeather(city)
              }
            }}
          />
          <button onClick={() => fetchWeather(city)}>Search</button>
        </div>
      </header>

      <main className="dashboard-grid">
        {error && <div className="error-message">{error}</div>}

        {weather && (
          <>
            <div className="card hero-card">
              <div className="hero-header">
                <h2>{weather.name}, Sri Lanka</h2>
                <span className="badge">LIVE DATA</span>
              </div>
              
              <div className="hero-body">
                <div className="temp-section">
                  <h1 className="big-temp">{Math.round(weather.main.temp)}°</h1>
                  <div className="temp-details">
                    <p>Feels like {Math.round(weather.main.feels_like)}°C</p>
                    <p className="condition">{weather.weather[0].description}</p>
                  </div>
                </div>
                <img 
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
                  alt="weather icon" 
                  className="hero-icon"
                />
              </div>

              <div className="metrics-row">
                <div className="metric">
                  <span className="metric-label">HUMIDITY</span>
                  <span className="metric-value">{weather.main.humidity}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">WIND</span>
                  <span className="metric-value">{weather.wind.speed} m/s</span>
                </div>
                <div className="metric">
                  <span className="metric-label">PRESSURE</span>
                  <span className="metric-value">{weather.main.pressure} hPa</span>
                </div>
              </div>
            </div>

            <div className="bottom-row">
              <div className="card sub-card">
                <h3>Air Quality Index</h3>
                {aqi ? (
                  <div className="aqi-content">
                    <div className="aqi-main">
                      <span className="aqi-number" style={{ color: getAqiInfo(aqi.main.aqi).color }}>
                        {aqi.main.aqi}
                      </span>
                      <span className="aqi-text" style={{ color: getAqiInfo(aqi.main.aqi).color }}>
                        {getAqiInfo(aqi.main.aqi).text}
                      </span>
                    </div>
                    <div className="aqi-details">
                      <p><strong>PM2.5:</strong> {aqi.components.pm2_5} μg/m³</p>
                      <p><strong>CO:</strong> {aqi.components.co} μg/m³</p>
                      <p><strong>NO2:</strong> {aqi.components.no2} μg/m³</p>
                    </div>
                  </div>
                ) : (
                  <p className="loading-text">Loading AQI...</p>
                )}
              </div>

              <div className="card sub-card">
                <h3>5-Day Forecast (Noon)</h3>
                {forecast ? (
                  <div className="forecast-list">
                    {forecast.map((day, index) => {
                      const date = new Date(day.dt_txt);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                      return (
                        <div key={index} className="forecast-item">
                          <span className="day-name">{dayName}</span>
                          <img 
                            src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} 
                            alt="icon" 
                            className="forecast-icon"
                          />
                          <span className="forecast-temp">{Math.round(day.main.temp)}°C</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="loading-text">Loading forecast...</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App