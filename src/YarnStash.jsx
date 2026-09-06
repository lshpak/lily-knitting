import { useState } from 'react'
import { useStorage } from './useStorage'

const EMPTY = { brand: '', name: '', colorName: '', color: '#b56576', weight: '', yards: '', grams: '', skeins: '' }

export default function YarnStash() {
  const [yarns, setYarns] = useStorage('lily-yarns', [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)

  function set(field) {
    return e => setForm({ ...form, [field]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.brand.trim() && !form.name.trim()) return
    setYarns([{
      id: Date.now().toString(),
      brand: form.brand.trim(),
      name: form.name.trim(),
      colorName: form.colorName.trim(),
      color: form.color,
      weight: form.weight.trim(),
      yards: form.yards.trim(),
      grams: form.grams.trim(),
      skeins: form.skeins.trim(),
    }, ...yarns])
    setForm(EMPTY)
    setShowForm(false)
  }

  function deleteYarn(id) {
    if (confirm('Remove this yarn?')) {
      setYarns(yarns.filter(y => y.id !== id))
    }
  }

  function metaLine(yarn) {
    const parts = []
    if (yarn.weight) parts.push(yarn.weight)
    if (yarn.yards) parts.push(`${yarn.yards} yds`)
    if (yarn.grams) parts.push(`${yarn.grams}g`)
    if (yarn.skeins) parts.push(`${yarn.skeins} skein${yarn.skeins === '1' ? '' : 's'}`)
    return parts.join(' · ')
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
            placeholder="Brand (e.g. Malabrigo)"
            value={form.brand}
            onChange={set('brand')}
            className="input"
          />
          <input
            type="text"
            placeholder="Yarn name (e.g. Rios)"
            value={form.name}
            onChange={set('name')}
            className="input"
          />
          <div className="form-row">
            <label className="color-picker">
              <input type="color" value={form.color} onChange={set('color')} />
              <span className="color-swatch" style={{ background: form.color }} />
            </label>
            <input
              type="text"
              placeholder="Color name"
              value={form.colorName}
              onChange={set('colorName')}
              className="input"
              style={{ flex: 1 }}
            />
          </div>
          <input
            type="text"
            placeholder="Weight (DK, Worsted, Bulky...)"
            value={form.weight}
            onChange={set('weight')}
            className="input"
          />
          <div className="form-row">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Yards"
              value={form.yards}
              onChange={set('yards')}
              className="input"
              style={{ flex: 1 }}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Grams"
              value={form.grams}
              onChange={set('grams')}
              className="input"
              style={{ flex: 1 }}
            />
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Total skeins"
            value={form.skeins}
            onChange={set('skeins')}
            className="input"
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={!form.brand.trim() && !form.name.trim()}>Add</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setForm(EMPTY) }}>Cancel</button>
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
          <div key={yarn.id} className="yarn-card">
            <div className="yarn-card-top">
              <span className="yarn-dot" style={{ background: yarn.color }} />
              <div className="yarn-card-info">
                {yarn.brand && <span className="yarn-brand">{yarn.brand}</span>}
                <h3>{yarn.name}</h3>
                {yarn.colorName && <span className="yarn-color-name">{yarn.colorName}</span>}
              </div>
              <button className="btn btn-ghost btn-sm delete-btn" onClick={() => deleteYarn(yarn.id)}>
                &times;
              </button>
            </div>
            {metaLine(yarn) && (
              <span className="yarn-meta">{metaLine(yarn)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
