export default function WeatherCard({ weather: data }) {
  if (!data) return null

  const { name, sys, main, weather, wind } = data
  const condition = weather?.[0]

  console.log(condition.iconUrl, "condition.iconUrl")

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
    </div>
  )
}
