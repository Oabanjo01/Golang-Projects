export async function fetchWeather(city) {
  const res = await fetch(`/api/weather/${encodeURIComponent(city)}`)

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }

  return res.json()
}
