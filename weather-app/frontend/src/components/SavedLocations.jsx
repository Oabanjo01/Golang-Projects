export default function SavedLocations({ locations, loading, error, onDelete, deletingId }) {
  return (
    <section className="saved-locations">
      <h2>Saved locations</h2>

      {loading && <p className="saved-locations-empty">Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && locations.length === 0 && (
        <p className="saved-locations-empty">Nothing saved yet.</p>
      )}

      <ul>
        {locations.map((location) => (
          <li key={location.id}>
            <span className="saved-location-name">
              {location.name}
              {location.country ? `, ${location.country}` : ''}
            </span>
            <span className="saved-location-coords">
              {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
            </span>
            <button
              className="delete-button"
              onClick={() => onDelete(location.id)}
              disabled={deletingId === location.id}
              aria-label={`Delete ${location.name}`}
            >
              {deletingId === location.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
