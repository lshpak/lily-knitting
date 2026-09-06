import { useState } from 'react'
import { useStorage } from './useStorage'

export default function YarnStash() {
  const [yarns, setYarns] = useStorage('lily-yarns', [])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#b56576')
  const [weight, setWeight] = useState('')
  const [quantity, setQuantity] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setYarns([{
      id: Date.now().toString(),
      name: name.trim(),
      color,
      weight: weight.trim(),
      quantity: quantity.trim(),
    }, ...yarns])
    setName('')
    setColor('#b56576')
    setWeight('')
    setQuantity('')
    setShowForm(false)
  }

  function deleteYarn(id) {
    if (confirm('Remove this yarn?')) {
      setYarns(yarns.filter(y => y.id !== id))
    }
  }

  return (
    <div className="section-list">
      {!showForm ? (
        <button className="btn btn-primary add-btn" onClick={() => setShowForm(true)}>
          + Add Yarn
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="item-form">
          <input
            autoFocus
            type="text"
            placeholder="Yarn name / brand..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="input"
          />
          <div className="form-row">
            <label className="color-picker">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} />
              <span className="color-swatch" style={{ background: color }} />
              Color
            </label>
            <input
              type="text"
              placeholder="Weight (DK, Worsted...)"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="input input-sm"
            />
          </div>
          <input
            type="text"
            placeholder="Quantity (e.g. 3 skeins)"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="input"
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>Add</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {yarns.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">🧵</div>
          <p>No yarn yet</p>
          <p className="subtle">Add yarn to keep track of your stash</p>
        </div>
      )}

      <div className="items">
        {yarns.map(yarn => (
          <div key={yarn.id} className="item-card">
            <div className="item-card-left">
              <span className="yarn-dot" style={{ background: yarn.color }} />
              <div className="item-card-info">
                <h3>{yarn.name}</h3>
                <span className="item-card-meta">
                  {[yarn.weight, yarn.quantity].filter(Boolean).join(' · ') || ' '}
                </span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm delete-btn" onClick={() => deleteYarn(yarn.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
