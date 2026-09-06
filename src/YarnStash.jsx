import { useState } from 'react'
import { useStorage } from './useStorage'

const EMPTY = { brand: '', name: '', colorName: '', weight: '', yards: '', grams: '', skeins: '' }

export default function YarnStash({ projects }) {
  const [yarns, setYarns] = useStorage('lily-yarns', [])
  const [pastYarns, setPastYarns] = useStorage('lily-yarns-past', [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [linkingId, setLinkingId] = useState(null)

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
      projectId: null,
    }, ...yarns])
    setForm(EMPTY)
    setShowForm(false)
  }

  function updateSkeins(id, delta) {
    const yarn = yarns.find(y => y.id === id)
    if (!yarn) return
    const current = getSkeins(yarn)
    const next = Math.max(0, current + delta)
    if (next === 0) {
      setPastYarns([{ ...yarn, skeins: 0 }, ...pastYarns])
      setYarns(yarns.filter(y => y.id !== id))
    } else {
      setYarns(yarns.map(y => y.id === id ? { ...y, skeins: next } : y))
    }
  }

  function linkToProject(yarnId, projectId) {
    setYarns(yarns.map(y => y.id === yarnId ? { ...y, projectId } : y))
    setLinkingId(null)
  }

  function unlinkFromProject(yarnId) {
    setYarns(yarns.map(y => y.id === yarnId ? { ...y, projectId: null } : y))
  }

  function restoreYarn(id) {
    const yarn = pastYarns.find(y => y.id === id)
    if (!yarn) return
    setYarns([{ ...yarn, skeins: 1 }, ...yarns])
    setPastYarns(pastYarns.filter(y => y.id !== id))
  }

  function deleteYarn(id, past) {
    if (!confirm('Remove this yarn?')) return
    if (past) {
      setPastYarns(pastYarns.filter(y => y.id !== id))
    } else {
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

  function getProjectName(projectId) {
    const p = projects.find(proj => proj.id === projectId)
    return p ? p.name : null
  }

  const inUseYarns = yarns.filter(y => y.projectId && getProjectName(y.projectId))
  const stashYarns = yarns.filter(y => !y.projectId || !getProjectName(y.projectId))

  function renderYarnCard(yarn, isPast) {
    const sk = getSkeins(yarn)
    const total = totalYards(yarn)
    const projectName = yarn.projectId ? getProjectName(yarn.projectId) : null

    return (
      <div key={yarn.id} className={`yarn-card ${isPast ? 'yarn-card-past' : ''}`}>
        <div className="yarn-card-top">
          <div className="yarn-card-info">
            {yarn.brand && <span className="yarn-brand">{yarn.brand}</span>}
            <h3>{yarn.name}</h3>
            {yarn.colorName && <span className="yarn-color-name">{yarn.colorName}</span>}
          </div>
          <button className="btn btn-ghost btn-sm delete-btn" onClick={() => deleteYarn(yarn.id, isPast)}>
            &times;
          </button>
        </div>
        {metaLine(yarn) && (
          <span className="yarn-meta">{metaLine(yarn)}</span>
        )}
        {!isPast && (
          <>
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
            {projectName ? (
              <div className="yarn-project-link">
                <span className="yarn-project-tag">For: {projectName}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => unlinkFromProject(yarn.id)}>
                  Unlink
                </button>
              </div>
            ) : linkingId === yarn.id ? (
              <div className="yarn-link-picker">
                {projects.length === 0 ? (
                  <span className="yarn-link-empty">No WIPs to link to</span>
                ) : (
                  projects.map(p => (
                    <button
                      key={p.id}
                      className="btn btn-ghost btn-sm yarn-link-option"
                      onClick={() => linkToProject(yarn.id, p.id)}
                    >
                      {p.name}
                    </button>
                  ))
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setLinkingId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => setLinkingId(yarn.id)}>
                Link to project
              </button>
            )}
          </>
        )}
        {isPast && (
          <button className="btn btn-ghost btn-sm" onClick={() => restoreYarn(yarn.id)}>
            Restore to stash
          </button>
        )}
      </div>
    )
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

      {yarns.length === 0 && !showForm && pastYarns.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧵</div>
          <p>No yarn yet</p>
          <p className="subtle">Add yarn to keep track of your stash</p>
        </div>
      )}

      {inUseYarns.length > 0 && (
        <>
          <p className="completed-label">In Use ({inUseYarns.length})</p>
          <div className="items">
            {inUseYarns.map(yarn => renderYarnCard(yarn, false))}
          </div>
        </>
      )}

      {stashYarns.length > 0 && (
        <>
          {inUseYarns.length > 0 && <p className="completed-label">Stash ({stashYarns.length})</p>}
          <div className="items">
            {stashYarns.map(yarn => renderYarnCard(yarn, false))}
          </div>
        </>
      )}

      {pastYarns.length > 0 && (
        <>
          <p className="completed-label">Past Stash ({pastYarns.length})</p>
          <div className="items">
            {pastYarns.map(yarn => renderYarnCard(yarn, true))}
          </div>
        </>
      )}
    </div>
  )
}
