const STAR = 'M10 1.5l2.5 5.3 5.8.8-4.2 4.1 1 5.8L10 14.8 4.9 17.5l1-5.8L1.7 7.6l5.8-.8z'

export default function Stars({ value, size = 'h-4 w-4' }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 20 20"
          className={`${size} ${n <= Math.round(value) ? 'fill-butter' : 'fill-line'}`}
        >
          <path d={STAR} />
        </svg>
      ))}
    </span>
  )
}