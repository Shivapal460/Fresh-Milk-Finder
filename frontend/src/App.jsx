import { useState } from 'react'

const API = 'http://localhost:8000'

export default function App() {
  const [radius, setRadius] = useState(5)
  const [milkType, setMilkType] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const searchNearby = () => {
    setError('')
    if (!navigator.geolocation) {
      setError('Your browser does not support location.')
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const params = new URLSearchParams({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            radius,
          })
          if (milkType) params.append('milk_type', milkType)
          if (maxPrice) params.append('max_price', maxPrice)

          const res = await fetch(`${API}/vendors/nearby?${params}`)
          if (!res.ok) throw new Error('Server error')
          setVendors(await res.json())
          setSearched(true)
        } catch {
          setError('Could not load vendors. Is the backend running?')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLoading(false)
        setError('Location permission denied. Please allow location access and try again.')
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-1">Fresh Milk Finder</h1>
      <p className="text-gray-600 mb-6">Find fresh cow and buffalo milk near you.</p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <select
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="border rounded p-2"
        >
          <option value={2}>Within 2 km</option>
          <option value={5}>Within 5 km</option>
          <option value={10}>Within 10 km</option>
          <option value={25}>Within 25 km</option>
        </select>

        <select
          value={milkType}
          onChange={(e) => setMilkType(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Any milk</option>
          <option value="cow">Cow</option>
          <option value="buffalo">Buffalo</option>
        </select>

        <input
          type="number"
          placeholder="Max ₹/litre"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border rounded p-2"
        />
      </div>

      <button
        onClick={searchNearby}
        disabled={loading}
        className="w-full bg-green-600 text-white font-semibold rounded p-3 hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Searching...' : '📍 Use my location'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {searched && vendors.length === 0 && !error && (
        <p className="text-gray-600 mt-6">
          No vendors found in this area. Try a bigger radius.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {vendors.map((v) => (
          <div key={v.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold">{v.name}</h2>
              <span className="text-sm text-gray-500">{v.distance_km} km away</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                {v.milk_type}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                ₹{v.price_per_litre}/litre
              </span>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                🕒 {v.milking_time}
              </span>
              {v.home_delivery && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  🚚 Home delivery
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-gray-600">
              ⭐ {v.review_count > 0 ? `${v.average_rating} (${v.review_count} reviews)` : 'No reviews yet'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}