import { useState } from 'react'
import { saveLocation } from '../api.js'

export default function WeatherCard({ weather: data }) {
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error
  const [saveError, setSaveError] = useState(null)

  if (!data) return null

  const { name, sys, main, weather, wind, coord } = data
  const condition = weather?.[0]

  async function handleSave() {
    setSaveState('saving')
    setSaveError(null)
    try {
      await saveLocation({
        name,
        lat: coord.lat,
        lon: coord.lon,
        country: sys?.country ?? '',
      })
      setSaveState('saved')
    } catch (err) {
      setSaveState('error')
      setSaveError(err.message)
    }
  }

  return (
    <div className="weather-card">
      <div className="weather-card-header">
        <h2>
          {name}
          {sys?.country ? `, ${sys.country}` : ''}
        </h2>
        {condition?.iconUrl && <img src={condition.iconUrl} alt={condition.description} />}
      </div>
      <p className="temperature">{Math.round(main.temp)}°C</p>
      <p className="description">{condition?.description}</p>
      <div className="weather-details">
        <span>Feels like {Math.round(main.feels_like)}°C</span>
        <span>Humidity {main.humidity}%</span>
        <span>Wind {wind?.speed} m/s</span>
      </div>
      <button
        className="save-button"
        onClick={handleSave}
        disabled={saveState === 'saving' || saveState === 'saved'}
      >
        {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving...' : 'Save location'}
      </button>
      {saveState === 'error' && <p className="error">{saveError}</p>}
    </div>
  )
}
