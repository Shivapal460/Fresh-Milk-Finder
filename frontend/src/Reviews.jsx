import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function Reviews({ vendorId, onChange }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadReviews = async () => {
    try {
      const res = await fetch(`${API}/vendors/${vendorId}/reviews/`)
      if (!res.ok) throw new Error('Failed')
      setReviews(await res.json())
    } catch {
      setError('Could not load reviews.')
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
      await loadReviews()
      onChange()
    } catch {
      setError('Could not submit your review. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 border-t pt-4">
      {loading && <p className="text-sm text-gray-500">Loading reviews...</p>}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>
      )}

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-gray-50 rounded p-3">
            <div className="flex justify-between text-sm">
              <span>{'⭐'.repeat(r.rating)}</span>
              <span className="text-gray-500">
                {new Date(r.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
            {r.comment && <p className="mt-1 text-sm text-gray-700">{r.comment}</p>}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-4 space-y-2">
        <div className="flex gap-2">
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="border rounded p-2"
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Okay</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Bad</option>
          </select>
          <input
            placeholder="Write a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 border rounded p-2"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white rounded p-2 hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Submitting...' : 'Submit review'}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  )
}