import { useEffect, useState } from 'react'

export default function App() {
  const [vendors, setVendors] = useState([])

  useEffect(() => {
    fetch('http://localhost:8000/vendors/')
      .then(res => res.json())
      .then(setVendors)
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Fresh Milk Finder</h1>
      {vendors.map(v => (
        <div key={v.id} className="border rounded p-3 mb-2">{v.name}</div>
      ))}
    </div>
  )
}