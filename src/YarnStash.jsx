import { useState } from 'react'
import YarnForm from './YarnForm'

export default function YarnStash({ projects, yarns, pastYarns, yarnActions }) {
  const { addYarn, updateYarn, deleteYarn, moveYarnToPast, restoreYarn, deletePastYarn } = yarnActions
  const [showForm, setShowForm] = useState(false)
  const [linkingId, setLinkingId] = useState(null)

  function handleAddYarn(yarnData) {
    addYarn(yarnData)
    setShowForm(false)
  }

  function updateSkeins(id, delta) {
    const yarn = yarns.find(y => y.id === id)
    if (!yarn) return
    const current = getSkeins(yarn)
    const next = round(Math.max(0, current + delta))
    if (next === 0) {
      moveYarnToPast(id)
    } else {
      updateYarn(id, { skeins: next })
    }
  }

  function linkToProject(yarnId, projectId) {
    updateYarn(yarnId, { projectId })
    setLinkingId(null)
  }

  function unlinkFromProject(yarnId) {
    updateYarn(yarnId, { projectId: null })
  }

  function handleDeleteYarn(id, past) {
    if (!confirm('Remove this yarn?')) return
    if (past) {
      deletePastYarn(id)
    } else {
      deleteYarn(id)
    }
  }

  function getSkeins(yarn) {
    return typeof yarn.skeins === 'number' ? yarn.skeins : (parseFloat(yarn.skeins) || 0)
  }

  function round(n) {
    return Math.round(n * 100) / 100
  }

  function formatSkeins(n) {
    return n % 1 === 0 ? n.toString() : n.toFixed(2).replace(/0$/, '')
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
          <button className="btn btn-ghost btn-sm delete-btn" onClick={() => handleDeleteYarn(yarn.id, isPast)}>
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
                className="btn btn-skein btn-skein-sm"
                onClick={() => updateSkeins(yarn.id, -0.25)}
                disabled={sk < 0.25}
              >
                -.25
              </button>
              <button
                className="btn btn-skein"
                onClick={() => updateSkeins(yarn.id, -1)}
                disabled={sk < 1}
              >
                -1
              </button>
              <span className="yarn-skein-count">
                {formatSkeins(sk)}
              </span>
              <button
                className="btn btn-skein"
                onClick={() => updateSkeins(yarn.id, 1)}
              >
                +1
              </button>
              <button
                className="btn btn-skein btn-skein-sm"
                onClick={() => updateSkeins(yarn.id, 0.25)}
              >
                +.25
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
        <YarnForm onSubmit={handleAddYarn} onCancel={() => setShowForm(false)} />
      )}

      {yarns.length === 0 && !showForm && pastYarns.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-text">~</div>
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
