export async function fetchWeather(city) {
  const res = await fetch(`/api/weather/${encodeURIComponent(city)}`)

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }

  return res.json()
}

export async function fetchSavedLocations() {
  const res = await fetch('/api/locations')

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }

  // A nil slice on the Go side encodes as `null`, so normalise to an array.
  return (await res.json()) ?? []
}

export async function deleteLocation(id) {
  const res = await fetch(`/api/locations/${encodeURIComponent(id)}`, { method: 'DELETE' })

  // 204 No Content has no body, so don't parse one on success.
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }
}

export async function saveLocation(location) {
  const res = await fetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(location),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error || `Request failed with status ${res.status}`)
  }
}
