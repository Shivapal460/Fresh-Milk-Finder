import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const MILK_TYPES = [
  { value: 'cow', label: 'Cow' },
  { value: 'buffalo', label: 'Buffalo' },
  { value: 'a2', label: 'A2' },
]

const emptyForm = {
  name: '',
  latitude: '',
  longitude: '',
  milk_type: 'cow',
  price_per_litre: '',
  milking_time: 'morning',
  home_delivery: false,
}

const fieldClass = 'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base'

export default function VendorForm() {
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))
  const hasLocation = form.latitude !== '' && form.longitude !== ''

  const useMyLocation = () => {
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        })),
      () => setError('Location is blocked. Allow location for this site in your browser and try again.')
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!hasLocation) {
      setError("Set the dairy's location first.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`${API}/vendors/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          price_per_litre: Number(form.price_per_litre),
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setMessage('Dairy added. You can now find it from the Find milk tab.')
      setForm(emptyForm)
    } catch {
      setError('Could not add the dairy. Check every field and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl">
      <h2 className="font-display text-2xl font-extrabold">Add a dairy</h2>
      <p className="mt-1 text-muted">
        Know a dairy that sells fresh milk? Add it so others nearby can find it.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="dairy-name" className="mb-1.5 block text-sm font-semibold">
            Dairy name
          </label>
          <input
            id="dairy-name"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold">Milk type</p>
          <div className="flex flex-wrap gap-2">
            {MILK_TYPES.map((m) => (
              <button
                key={m.value}
                type="button"
                aria-pressed={form.milk_type === m.value}
                onClick={() => update('milk_type', m.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                  form.milk_type === m.value
                    ? 'border-pasture bg-pasture text-white'
                    : 'border-line bg-white hover:bg-meadow'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="dairy-price" className="mb-1.5 block text-sm font-semibold">
              Price per litre
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                ₹
              </span>
              <input
                id="dairy-price"
                required
                type="number"
                min="1"
                step="any"
                value={form.price_per_litre}
                onChange={(e) => update('price_per_litre', e.target.value)}
                className={`${fieldClass} pl-8`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="dairy-time" className="mb-1.5 block text-sm font-semibold">
              Milking time
            </label>
            <select
              id="dairy-time"
              value={form.milking_time}
              onChange={(e) => update('milking_time', e.target.value)}
              className={fieldClass}
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="morning and evening">Morning and evening</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-meadow p-4">
          <p className="text-sm font-semibold">Dairy location</p>
          <p className="mt-1 text-sm text-muted">
            {hasLocation
              ? `Saved: ${form.latitude}, ${form.longitude}`
              : 'Stand at the dairy and tap the button, so people find it at the right spot.'}
          </p>
          <button
            type="button"
            onClick={useMyLocation}
            className="mt-3 rounded-full border border-pasture px-4 py-2 text-sm font-semibold text-pasture hover:bg-white"
          >
            Use my current location
          </button>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.home_delivery}
            onChange={(e) => update('home_delivery', e.target.checked)}
            className="h-5 w-5 accent-pasture"
          />
          <span>Offers home delivery</span>
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-pasture px-6 py-3 font-semibold text-white hover:bg-pasture-dark disabled:opacity-60"
        >
          {saving ? 'Adding...' : 'Add dairy'}
        </button>

        {message && <p className="font-semibold text-pasture">{message}</p>}
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
      </div>
    </form>
  )
}