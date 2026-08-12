import { useCallback, useEffect, useState } from 'react'
import SearchBar from './components/SearchBar.jsx'
import WeatherCard from './components/WeatherCard.jsx'
import SavedLocations from './components/SavedLocations.jsx'
import { fetchWeather, fetchSavedLocations, deleteLocation } from './api.js'
import './App.css'

export default function App() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [saved, setSaved] = useState([])
  const [savedLoading, setSavedLoading] = useState(true)
  const [savedError, setSavedError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadSaved = useCallback(async () => {
    setSavedLoading(true)
    setSavedError(null)
    try {
      setSaved(await fetchSavedLocations())
    } catch (err) {
      setSavedError(err.message)
    } finally {
      setSavedLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSaved()
  }, [loadSaved])

  async function handleDelete(id) {
    setDeletingId(id)
    setSavedError(null)
    try {
      await deleteLocation(id)
      await loadSaved()
    } catch (err) {
      setSavedError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

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
      <WeatherCard key={weather?.name} weather={weather} onSaved={loadSaved} />
      <SavedLocations
        locations={saved}
        loading={savedLoading}
        error={savedError}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  )
}