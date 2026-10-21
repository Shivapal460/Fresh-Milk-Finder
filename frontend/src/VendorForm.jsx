import { useState } from 'react'

const API = 'http://localhost:8000'

const emptyForm = {
  name: '',
  latitude: '',
  longitude: '',
  milk_type: 'cow',
  price_per_litre: '',
  milking_time: 'morning',
  home_delivery: false,
}

export default function VendorForm() {
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setForm({ ...form, [field]: value })

  const useMyLocation = () => {
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        })),
      () => setError('Location permission denied.')
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!form.latitude || !form.longitude) {
      setError('Please set the vendor location first.')
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
      setMessage('Vendor added successfully!')
      setForm(emptyForm)
    } catch {
      setError('Could not add vendor. Check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        required
        placeholder="Vendor name"
        value={form.name}
        onChange={(e) => update('name', e.target.value)}
        className="w-full border rounded p-2"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.milk_type}
          onChange={(e) => update('milk_type', e.target.value)}
          className="border rounded p-2"
        >
          <option value="cow">Cow</option>
          <option value="buffalo">Buffalo</option>
        </select>
        <input
          required
          type="number"
          min="1"
          placeholder="Price per litre (₹)"
          value={form.price_per_litre}
          onChange={(e) => update('price_per_litre', e.target.value)}
          className="border rounded p-2"
        />
      </div>

      <select
        value={form.milking_time}
        onChange={(e) => update('milking_time', e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="morning">Morning</option>
        <option value="evening">Evening</option>
        <option value="morning and evening">Morning and evening</option>
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          readOnly
          placeholder="Latitude"
          value={form.latitude}
          className="border rounded p-2 bg-gray-50"
        />
        <input
          readOnly
          placeholder="Longitude"
          value={form.longitude}
          className="border rounded p-2 bg-gray-50"
        />
      </div>

      <button
        type="button"
        onClick={useMyLocation}
        className="w-full border border-green-600 text-green-700 rounded p-2 hover:bg-green-50"
      >
        📍 Use my current location
      </button>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.home_delivery}
          onChange={(e) => update('home_delivery', e.target.checked)}
        />
        Home delivery available
      </label>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-600 text-white font-semibold rounded p-3 hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Add vendor'}
      </button>

      {message && <p className="text-green-700">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}