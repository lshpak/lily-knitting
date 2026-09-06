import { useState } from 'react'

const EMPTY = { brand: '', name: '', colorName: '', weight: '', yards: '', grams: '', skeins: '' }

export default function YarnForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY)

  function set(field) {
    return e => setForm({ ...form, [field]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.brand.trim() && !form.name.trim()) return
    onSubmit({
      brand: form.brand.trim(),
      name: form.name.trim(),
      colorName: form.colorName.trim(),
      weight: form.weight.trim(),
      yardsPerSkein: form.yards.trim(),
      grams: form.grams.trim(),
      skeins: parseInt(form.skeins, 10) || 0,
      projectId: null,
    })
    setForm(EMPTY)
  }

  return (
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
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
