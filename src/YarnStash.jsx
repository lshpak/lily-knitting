import { useState } from 'react'
import { useStorage } from './useStorage'

const EMPTY = { brand: '', name: '', colorName: '', weight: '', yards: '', grams: '', skeins: '' }

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
    const skeins = parseInt(form.skeins, 10) || 0
    setYarns([{
      id: Date.now().toString(),
      brand: form.brand.trim(),
      name: form.name.trim(),
      colorName: form.colorName.trim(),
      weight: form.weight.trim(),
      yardsPerSkein: form.yards.trim(),
      grams: form.grams.trim(),
      skeins,
    }, ...yarns])
    setForm(EMPTY)
    setShowForm(false)
  }

  function updateSkeins(id, delta) {
    setYarns(yarns.map(y => {
      if (y.id !== id) return y
      const current = typeof y.skeins === 'number' ? y.skeins : (parseInt(y.skeins, 10) || 0)
      return { ...y, skeins: Math.max(0, current + delta) }
    }))
  }

  function deleteYarn(id) {
    if (confirm('Remove this yarn?')) {
      setYarns(yarns.filter(y => y.id !== id))
    }
  }

  function getSkeins(yarn) {
    return typeof yarn.skeins === 'number' ? yarn.skeins : (parseInt(yarn.skeins, 10) || 0)
  }

  function getYardsPerSkein(yarn) {
    const val = yarn.yardsPerSkein ?? yarn.yards
    return parseInt(val, 10) || 0
  }

  function totalYards(yarn) {
    const yps = getYardsPerSkein(yarn)
    const sk = getSkeins(yarn)
    if (!yps || !sk) return null
    return yps * sk
  }

  function metaLine(yarn) {
    const parts = []
    if (yarn.weight) parts.push(yarn.weight)
    const yps = getYardsPerSkein(yarn)
    if (yps) parts.push(`${yps} yds/skein`)
    if (yarn.grams) parts.push(`${yarn.grams}g/skein`)
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
          <input
            type="text"
            placeholder="Color name"
            value={form.colorName}
            onChange={set('colorName')}
            className="input"
          />
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
              placeholder="Yards per skein"
              value={form.yards}
              onChange={set('yards')}
              className="input"
              style={{ flex: 1 }}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Grams per skein"
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
        {yarns.map(yarn => {
          const sk = getSkeins(yarn)
          const total = totalYards(yarn)
          return (
            <div key={yarn.id} className="yarn-card">
              <div className="yarn-card-top">
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
              <div className="yarn-skeins-row">
                <button
                  className="btn btn-skein"
                  onClick={() => updateSkeins(yarn.id, -1)}
                  disabled={sk === 0}
                >
                  &minus;
                </button>
                <span className="yarn-skein-count">
                  {sk} skein{sk === 1 ? '' : 's'}
                </span>
                <button
                  className="btn btn-skein"
                  onClick={() => updateSkeins(yarn.id, 1)}
                >
                  +
                </button>
              </div>
              {total !== null && (
                <span className="yarn-total-yards">{total.toLocaleString()} total yards</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
