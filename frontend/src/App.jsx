import { useState } from 'react'
import VendorForm from './VendorForm'
import Reviews from './Reviews'
import Stars from './Stars'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const RADIUS_OPTIONS = [2, 5, 10, 25]

const MILK_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'cow', label: 'Cow' },
  { value: 'buffalo', label: 'Buffalo' },
  { value: 'a2', label: 'A2' },
]

const MILK_STYLES = {
  cow: 'bg-sky-100 text-sky-900',
  buffalo: 'bg-stone-200 text-stone-800',
  a2: 'bg-amber-100 text-amber-900',
}

const fieldClass = 'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base'

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

function Bottle() {
  return (
    <svg viewBox="0 0 120 200" className="hidden h-40 shrink-0 md:block" aria-hidden="true">
      <rect x="42" y="4" width="36" height="14" rx="4" fill="#f4b63a" />
      <path
        d="M44 18h32v26c0 10 24 22 24 48v88a12 12 0 0 1-12 12H32a12 12 0 0 1-12-12V92c0-26 24-38 24-48z"
        fill="#ffffff"
      />
      <rect x="30" y="104" width="60" height="52" rx="8" fill="#1f5c3f" opacity="0.12" />
      <path
        d="M38 120h44M38 136h28"
        stroke="#1f5c3f"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

export default function App() {
  const [tab, setTab] = useState('search')
  const [radius, setRadius] = useState(5)
  const [milkType, setMilkType] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [resultsRadius, setResultsRadius] = useState(5)
  const [openId, setOpenId] = useState(null)

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
          setResultsRadius(radius)
          setSearched(true)
        } catch {
          setError('Could not load dairies. Check your connection and try again.')
        } finally {
          setLoading(false)
        }
      },
      () => {
        setLoading(false)
        setError('Location is blocked. Allow location for this site in your browser, then try again.')
      }
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-pasture text-white">
        <div className="mx-auto max-w-5xl px-5">
          <nav className="flex items-center justify-between gap-4 py-4">
            <span className="font-display text-lg font-bold">Fresh Milk Finder</span>
            <div className="flex rounded-full bg-white/10 p-1 text-sm font-semibold">
              {[
                ['search', 'Find milk'],
                ['add', 'Add a dairy'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  aria-pressed={tab === id}
                  className={`rounded-full px-4 py-1.5 ${
                    tab === id ? 'bg-white text-pasture' : 'text-white/85 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex items-end justify-between gap-8 pb-24 pt-8 md:pt-12">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">
                Fresh milk from dairies near you
              </h1>
              <p className="mt-4 text-lg text-white/85">
                Compare cow, buffalo and A2 milk by price, distance and home delivery.
              </p>
            </div>
            <Bottle />
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-14 max-w-5xl px-5 pb-16">
        {tab === 'add' ? (
          <section className="rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8">
            <VendorForm />
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-line bg-white p-5 shadow-sm md:p-6">
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label htmlFor="radius" className="mb-1.5 block text-sm font-semibold">
                    Distance
                  </label>
                  <select
                    id="radius"
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className={fieldClass}
                  >
                    {RADIUS_OPTIONS.map((km) => (
                      <option key={km} value={km}>
                        Within {km} km
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-1.5 text-sm font-semibold">Milk type</p>
                  <div className="flex flex-wrap gap-2">
                    {MILK_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={milkType === o.value}
                        onClick={() => setMilkType(o.value)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                          milkType === o.value
                            ? 'border-pasture bg-pasture text-white'
                            : 'border-line bg-white hover:bg-meadow'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="max-price" className="mb-1.5 block text-sm font-semibold">
                    Max price per litre
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                      ₹
                    </span>
                    <input
                      id="max-price"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="No limit"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className={`${fieldClass} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={searchNearby}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-pasture px-5 py-3.5 text-base font-semibold text-white hover:bg-pasture-dark disabled:opacity-60 md:w-auto"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {loading ? 'Finding dairies...' : 'Find dairies near me'}
              </button>
            </section>

            {error && (
              <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">
                {error}
              </p>
            )}

            {!searched && !loading && !error && (
              <div className="mt-8 rounded-2xl border border-dashed border-line p-8 text-center text-muted">
                Pick your filters and tap Find dairies near me. Your browser will ask for your
                location, and results appear from nearest to farthest.
              </div>
            )}

            {loading && vendors.length === 0 && (
              <div className="mt-8 rounded-2xl border border-dashed border-line p-8 text-center text-muted">
                Looking for dairies near you. The first search can take up to a minute while the
                server wakes up.
              </div>
            )}

            {searched && !loading && vendors.length === 0 && !error && (
              <div className="mt-8 rounded-2xl border border-dashed border-line p-8 text-center">
                <p className="font-display text-xl font-bold">No dairies within {resultsRadius} km</p>
                <p className="mt-2 text-muted">
                  Try a wider distance, or add a dairy you know.
                </p>
                <button
                  onClick={() => setTab('add')}
                  className="mt-4 rounded-full border border-pasture px-5 py-2 font-semibold text-pasture hover:bg-meadow"
                >
                  Add a dairy
                </button>
              </div>
            )}

            {vendors.length > 0 && (
              <>
                <p className="mb-3 mt-8 text-sm text-muted">
                  {vendors.length} {vendors.length === 1 ? 'dairy' : 'dairies'} within{' '}
                  {resultsRadius} km, nearest first
                </p>

                <div className="grid gap-4 md:grid-cols-2 md:items-start">
                  {vendors.map((v) => (
                    <article
                      key={v.id}
                      className={`rounded-2xl border border-line bg-white p-5 shadow-sm ${
                        openId === v.id ? 'md:col-span-2' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display text-xl font-bold">{v.name}</h2>
                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              MILK_STYLES[v.milk_type] || 'bg-stone-200 text-stone-800'
                            }`}
                          >
                            {v.milk_type}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-extrabold leading-none">
                            ₹{v.price_per_litre}
                          </p>
                          <p className="mt-1 text-xs text-muted">per litre</p>
                        </div>
                      </div>

                      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <dt className="text-muted">Distance</dt>
                          <dd className="font-semibold">{formatDistance(v.distance_km)}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Milking</dt>
                          <dd className="font-semibold capitalize">{v.milking_time || 'Not listed'}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Delivery</dt>
                          <dd className="font-semibold">{v.home_delivery ? 'Home delivery' : 'Pick-up only'}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Stars value={v.average_rating || 0} />
                          <span className="text-muted">
                            {v.review_count > 0
                              ? `${Number(v.average_rating).toFixed(1)} (${v.review_count} ${
                                  v.review_count === 1 ? 'review' : 'reviews'
                                })`
                              : 'No reviews yet'}
                          </span>
                        </div>
                        <button
                          onClick={() => setOpenId(openId === v.id ? null : v.id)}
                          className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-pasture hover:bg-meadow"
                        >
                          {openId === v.id ? 'Hide reviews' : 'Reviews'}
                        </button>
                      </div>

                      {openId === v.id && <Reviews vendorId={v.id} onChange={searchNearby} />}
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}