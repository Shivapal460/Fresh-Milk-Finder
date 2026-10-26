import { useEffect, useState } from 'react'
import Stars from './Stars'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const STAR = 'M10 1.5l2.5 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8 4.9 17.5l1-5.8L1.7 7.6l5.8-.8z'
const LABELS = { 1: 'Bad', 2: 'Poor', 3: 'Okay', 4: 'Good', 5: 'Excellent' }

export default function Reviews({ vendorId, onChange }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadReviews = async () => {
    try {
      const res = await fetch(`${API}/vendors/${vendorId}/reviews/`)
      if (!res.ok) throw new Error('Failed')
      setReviews(await res.json())
    } catch {
      setError('Could not load reviews. Refresh the page and try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [vendorId])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const res = await fetch(`${API}/vendors/${vendorId}/reviews/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: Number(rating),
          comment: comment.trim() || null,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setComment('')
      setRating(5)
      setMessage('Review submitted.')
      await loadReviews()
      onChange()
    } catch {
      setError('Could not submit your review. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-5 border-t border-line pt-5">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-bold">What people say</h3>
          {loading && <p className="mt-3 text-sm text-muted">Loading reviews...</p>}
          {!loading && reviews.length === 0 && (
            <p className="mt-3 text-sm text-muted">No reviews yet. Yours can be the first.</p>
          )}
          <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl bg-meadow p-3.5">
                <div className="flex items-center justify-between">
                  <Stars value={r.rating} />
                  <span className="text-xs text-muted">
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit}>
          <h3 className="font-display text-lg font-bold">Rate this dairy</h3>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex gap-0.5" role="group" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} out of 5`}
                  aria-pressed={rating === n}
                  className="rounded p-0.5"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className={`h-8 w-8 ${n <= rating ? 'fill-butter' : 'fill-line'}`}
                  >
                    <path d={STAR} />
                  </svg>
                </button>
              ))}
            </div>
            <span className="text-sm text-muted">{LABELS[rating]}</span>
          </div>

          <label htmlFor={`comment-${vendorId}`} className="mt-4 block text-sm font-semibold">
            Comment (optional)
          </label>
          <textarea
            id={`comment-${vendorId}`}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the milk and the delivery?"
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-base"
          />

          <button
            type="submit"
            disabled={saving}
            className="mt-3 rounded-xl bg-pasture px-5 py-2.5 font-semibold text-white hover:bg-pasture-dark disabled:opacity-60"
          >
            {saving ? 'Submitting...' : 'Submit review'}
          </button>
          {message && <p className="mt-3 text-sm font-semibold text-pasture">{message}</p>}
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}