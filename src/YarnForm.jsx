import { useState } from 'react'

const EMPTY = { brand: '', name: '', colorName: '', weight: '', yards: '', lengthUnit: 'yards', grams: '', weightUnit: 'grams', skeins: '' }

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
      lengthUnit: form.lengthUnit,
      grams: form.grams.trim(),
      weightUnit: form.weightUnit,
      skeins: parseFloat(form.skeins) || 0,
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
          placeholder={`${form.lengthUnit === 'yards' ? 'Yards' : 'Meters'} per skein`}
          value={form.yards}
          onChange={set('yards')}
          className="input"
          style={{ flex: 1 }}
        />
        <select
          className="input unit-select"
          value={form.lengthUnit}
          onChange={set('lengthUnit')}
        >
          <option value="yards">yards</option>
          <option value="meters">meters</option>
        </select>
      </div>
      <div className="form-row">
        <input
          type="text"
          inputMode="numeric"
          placeholder={`${form.weightUnit === 'grams' ? 'Grams' : 'Ounces'} per skein`}
          value={form.grams}
          onChange={set('grams')}
          className="input"
          style={{ flex: 1 }}
        />
        <select
          className="input unit-select"
          value={form.weightUnit}
          onChange={set('weightUnit')}
        >
          <option value="grams">grams</option>
          <option value="ounces">ounces</option>
        </select>
      </div>
      <div className="skeins-input-row">
        <button type="button" className="btn btn-skein" onClick={() => setForm({ ...form, skeins: String(Math.max(0, (parseFloat(form.skeins) || 0) - 0.25)) })}>
          -.25
        </button>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Total skeins"
          value={form.skeins}
          onChange={set('skeins')}
          className="input skeins-input"
        />
        <button type="button" className="btn btn-skein" onClick={() => setForm({ ...form, skeins: String((parseFloat(form.skeins) || 0) + 0.25) })}>
          +.25
        </button>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={!form.brand.trim() && !form.name.trim()}>Add</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
