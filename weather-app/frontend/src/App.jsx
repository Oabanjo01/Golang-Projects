import { useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import WeatherCard from './components/WeatherCard.jsx'
import { fetchWeather } from './api.js'
import './App.css'

export default function App() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSearch(city) {
    setLoading(true)
    setError(null)
    try {
      setWeather(await fetchWeather(city))
    } catch (err) {
      setError(err.message)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>Weather Dashboard</h1>
      <SearchBar onSearch={handleSearch} loading={loading} />
      {error && <p className="error">{error}</p>}
      <WeatherCard key={weather?.name} weather={weather} />
    </div>
  )
}
