import { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [city, setCity] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (city.trim()) onSearch(city.trim())
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter a city..."
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Search'}
      </button>
    </form>
  )
}
