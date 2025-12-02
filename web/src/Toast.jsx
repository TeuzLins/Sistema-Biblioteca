import { useEffect, useState } from 'react'

const listeners = []
export const toast = (message, type = 'info') => listeners.forEach(fn => fn({ message, type }))

export default function ToastHost() {
  const [items, setItems] = useState([])
  useEffect(() => {
    const on = ({ message, type }) => {
      const id = Math.random().toString(36).slice(2)
      setItems(s => [...s, { id, message, type }])
      setTimeout(() => setItems(s => s.filter(i => i.id !== id)), 2500)
    }
    listeners.push(on)
    return () => { const i = listeners.indexOf(on); if (i>=0) listeners.splice(i,1) }
  }, [])
  return (
    <div className="toastHost">
      {items.map(i => <div key={i.id} className={`toast ${i.type}`}>{i.message}</div>)}
    </div>
  )
}