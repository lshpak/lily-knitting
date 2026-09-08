import { useState, useEffect } from 'react'
import { getDrivePreviewUrl, pickFromDrive } from './googleDrive'
import YarnForm from './YarnForm'

export default function ProjectDetail({ project, yarns = [], yarnActions, bankPatterns = [], onUpdate, onDelete, onFinish, onBack, onAddPattern }) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [editType, setEditType] = useState(project.type || '')
  const [editDesigner, setEditDesigner] = useState(project.designer || '')
  const [editSize, setEditSize] = useState(project.size || '')
  const [editStartedAt, setEditStartedAt] = useState(project.startedAt || '')
  const [showPdf, setShowPdf] = useState(false)
  const [pickingPattern, setPickingPattern] = useState(false)
  const [pickingDrive, setPickingDrive] = useState(false)
  const [yarnMode, setYarnMode] = useState(null)
  const [newCounterName, setNewCounterName] = useState('')

  const linkedYarns = yarns.filter(y => y.projectId === project.id)
  const availableYarns = yarns.filter(y => !y.projectId)

  function startEditing() {
    setEditName(project.name)
    setEditType(project.type || '')
    setEditDesigner(project.designer || '')
    setEditSize(project.size || '')
    setEditStartedAt(project.startedAt || '')
    setEditing(true)
  }

  function saveEdit() {
    const trimmed = editName.trim()
    if (!trimmed) return
    onUpdate({ name: trimmed, type: editType.trim(), designer: editDesigner.trim(), size: editSize.trim(), startedAt: editStartedAt || null })
    setEditing(false)
  }

  const linkedPattern = project.patternId
    ? bankPatterns.find(p => p.id === project.patternId)
    : null

  useEffect(() => {
    setShowPdf(false)
    setPickingPattern(false)
  }, [project.id, project.patternId])

  function handleUnlink() {
    if (!confirm('Remove pattern?')) return
    onUpdate({ patternId: null })
  }

  function handleLinkPattern(patternId) {
    onUpdate({ patternId })
    setPickingPattern(false)
  }

  async function handleDrivePick() {
    setPickingDrive(true)
    try {
      const result = await pickFromDrive()
      if (!result) return
      const existing = bankPatterns.find(p => p.driveFileId === result.driveFileId)
      if (existing) {
        onUpdate({ patternId: existing.id })
      } else {
        const id = Date.now().toString()
        const newPattern = {
          id,
          fileName: result.fileName,
          addedAt: new Date().toISOString(),
          source: 'drive',
          driveFileId: result.driveFileId,
        }
        onAddPattern(newPattern)
        onUpdate({ patternId: id })
      }
    } catch (err) {
      alert('Google Drive: ' + err.message)
    } finally {
      setPickingDrive(false)
    }
  }

  const pdfUrl = linkedPattern?.driveFileId
    ? getDrivePreviewUrl(linkedPattern.driveFileId)
    : null

  function handleAddNewYarn(yarnData) {
    yarnActions.addYarn({ ...yarnData, projectId: project.id, skeinsUsed: 0 })
    setYarnMode(null)
  }

  function handleLinkExisting(yarnId) {
    yarnActions.updateYarn(yarnId, { projectId: project.id, skeinsUsed: 0 })
    setYarnMode(null)
  }

  function handleUnlink(yarnId) {
    const yarn = yarns.find(y => y.id === yarnId)
    if (!yarn) return
    const used = yarn.skeinsUsed || 0
    yarnActions.updateYarn(yarnId, {
      projectId: null,
      skeins: getSkeins(yarn) + used,
      skeinsUsed: 0,
    })
  }

  function useSkein(yarnId, amount) {
    const yarn = yarns.find(y => y.id === yarnId)
    if (!yarn || getSkeins(yarn) < amount) return
    yarnActions.updateYarn(yarnId, {
      skeins: round(getSkeins(yarn) - amount),
      skeinsUsed: round((yarn.skeinsUsed || 0) + amount),
    })
  }

  function returnSkein(yarnId, amount) {
    const yarn = yarns.find(y => y.id === yarnId)
    if (!yarn || (yarn.skeinsUsed || 0) < amount) return
    yarnActions.updateYarn(yarnId, {
      skeins: round(getSkeins(yarn) + amount),
      skeinsUsed: round((yarn.skeinsUsed || 0) - amount),
    })
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

  const counters = project.counters || []

  function addCounter(e) {
    e.preventDefault()
    const name = newCounterName.trim()
    if (!name) return
    const counter = { id: Date.now().toString(), name, count: 0 }
    onUpdate({ counters: [...counters, counter] })
    setNewCounterName('')
  }

  function updateCounter(id, delta) {
    onUpdate({
      counters: counters.map(c =>
        c.id === id ? { ...c, count: Math.max(0, c.count + delta) } : c
      ),
    })
  }

  function deleteCounter(id) {
    onUpdate({ counters: counters.filter(c => c.id !== id) })
  }

  return (
    <div className="project-detail">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        &larr; Back
      </button>

      {editing ? (
        <div className="edit-project-form">
          <input
            autoFocus
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="input"
            placeholder="Project name"
          />
          <input
            type="text"
            value={editType}
            onChange={e => setEditType(e.target.value)}
            className="input"
            placeholder="Type (sweater, scarf, hat...)"
          />
          <input
            type="text"
            value={editDesigner}
            onChange={e => setEditDesigner(e.target.value)}
            className="input"
            placeholder="Pattern designer"
          />
          <input
            type="text"
            value={editSize}
            onChange={e => setEditSize(e.target.value)}
            className="input"
            placeholder="Size (S, M, L, 40in chest...)"
          />
          <input
            type="date"
            value={editStartedAt}
            onChange={e => setEditStartedAt(e.target.value)}
            className="input"
          />
          <div className="form-actions">
            <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={!editName.trim()}>Save</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="project-header">
          <div>
            {project.type && <span className="project-tag">{project.type}</span>}
            <h2 className="project-name">{project.name}</h2>
            {project.designer && <span className="project-meta">by {project.designer}</span>}
            {project.size && <span className="project-meta">Size: {project.size}</span>}
            {project.startedAt && <span className="project-meta">Started: {project.startedAt}</span>}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={startEditing}>Edit</button>
        </div>
      )}

      <div className="pattern-section">
        <label className="section-label">Pattern</label>
        {linkedPattern ? (
          <div className="pattern-attached">
            <div className="pattern-info">
              <span className="pattern-icon pattern-icon-drive">Drive</span>
              <span className="pattern-name">{linkedPattern.fileName}</span>
            </div>
            <div className="pattern-actions">
              <button className="btn btn-primary btn-sm" onClick={() => setShowPdf(!showPdf)}>
                {showPdf ? 'Hide' : 'View'}
              </button>
              <button className="btn btn-danger btn-sm" onClick={handleUnlink}>
                Unlink
              </button>
            </div>
          </div>
        ) : (
          <>
            {pickingPattern ? (
              <div className="pattern-picker">
                <p className="picker-title">Choose from Pattern Bank</p>
                {bankPatterns.length === 0 ? (
                  <p className="yarn-link-empty">No patterns in bank yet</p>
                ) : (
                  <div className="items">
                    {bankPatterns.map(bp => (
                      <button
                        key={bp.id}
                        className="project-yarn-pick-card"
                        onClick={() => handleLinkPattern(bp.id)}
                      >
                        <div className="pattern-info">
                          <span className="pattern-icon pattern-icon-drive">Drive</span>
                          <span className="pattern-name">{bp.fileName}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => setPickingPattern(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="pattern-link-actions">
                <button
                  className="btn btn-outline pattern-link-btn"
                  onClick={handleDrivePick}
                  disabled={pickingDrive}
                >
                  {pickingDrive ? 'Opening...' : 'Google Drive'}
                </button>
                <button
                  className="btn btn-outline pattern-link-btn"
                  onClick={() => setPickingPattern(true)}
                >
                  Pattern Bank
                </button>
              </div>
            )}
          </>
        )}
        {showPdf && pdfUrl && (
          <div className="pdf-viewer">
            <iframe src={pdfUrl} title="Pattern PDF" />
          </div>
        )}
      </div>

      <div className="counters-section">
        <label className="section-label">Counters</label>
        {counters.length > 0 && (
          <div className="items">
            {counters.map(c => (
              <div key={c.id} className="counter-card">
                <span className="counter-name">{c.name}</span>
                <div className="counter-controls">
                  <button
                    className="btn btn-skein"
                    onClick={() => updateCounter(c.id, -1)}
                    disabled={c.count === 0}
                  >
                    -1
                  </button>
                  <span className="counter-value">{c.count}</span>
                  <button
                    className="btn btn-skein"
                    onClick={() => updateCounter(c.id, 1)}
                  >
                    +1
                  </button>
                  <button
                    className="btn btn-ghost btn-sm delete-btn"
                    onClick={() => deleteCounter(c.id)}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={addCounter} className="counter-form">
          <input
            type="text"
            className="input input-sm"
            placeholder="Counter name..."
            value={newCounterName}
            onChange={e => setNewCounterName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!newCounterName.trim()}>
            Add
          </button>
        </form>
      </div>

      <div className="notes-section">
        <label className="section-label">Notes</label>
        <textarea
          className="notes-input"
          placeholder="Pattern notes, stitch counts, reminders..."
          value={project.notes}
          onChange={e => onUpdate({ notes: e.target.value })}
          rows={6}
        />
      </div>

      {yarnActions && <div className="project-yarn-section">
        <label className="section-label">Yarn</label>

        {linkedYarns.length > 0 && (
          <div className="items">
            {linkedYarns.map(yarn => {
              const used = yarn.skeinsUsed || 0
              const remaining = getSkeins(yarn)
              const yps = parseInt(yarn.yardsPerSkein ?? yarn.yards, 10) || 0
              return (
                <div key={yarn.id} className="project-yarn-card">
                  <div className="project-yarn-top">
                    <div className="project-yarn-info">
                      {yarn.brand && <span className="yarn-brand">{yarn.brand}</span>}
                      <h3>{yarn.name}</h3>
                      {yarn.colorName && <span className="yarn-color-name">{yarn.colorName}</span>}
                      {yarn.weight && <span className="yarn-meta-inline">{yarn.weight}</span>}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleUnlink(yarn.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="project-yarn-usage">
                    <div className="yarn-skeins-row">
                      <button
                        className="btn btn-skein btn-skein-sm"
                        onClick={() => returnSkein(yarn.id, 0.25)}
                        disabled={used < 0.25}
                      >
                        -.25
                      </button>
                      <button
                        className="btn btn-skein"
                        onClick={() => returnSkein(yarn.id, 1)}
                        disabled={used < 1}
                      >
                        -1
                      </button>
                      <span className="yarn-skein-count">
                        {formatSkeins(used)}
                      </span>
                      <button
                        className="btn btn-skein"
                        onClick={() => useSkein(yarn.id, 1)}
                        disabled={remaining < 1}
                      >
                        +1
                      </button>
                      <button
                        className="btn btn-skein btn-skein-sm"
                        onClick={() => useSkein(yarn.id, 0.25)}
                        disabled={remaining < 0.25}
                      >
                        +.25
                      </button>
                    </div>
                    <span className="yarn-remaining">used · {formatSkeins(remaining)} left in stash</span>
                    {yps > 0 && used > 0 && (
                      <span className="yarn-total-yards">{(yps * used).toLocaleString()} yards used</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {yarnMode === null && (
          <div className="project-yarn-actions">
            <button className="btn btn-outline project-yarn-btn" onClick={() => setYarnMode('stash')}>
              Add from Stash
            </button>
            <button className="btn btn-outline project-yarn-btn" onClick={() => setYarnMode('new')}>
              Add New Yarn
            </button>
          </div>
        )}

        {yarnMode === 'stash' && (
          <div className="project-yarn-picker">
            <p className="picker-title">Choose from stash</p>
            {availableYarns.length === 0 ? (
              <p className="yarn-link-empty">No unlinked yarn in stash</p>
            ) : (
              <div className="items">
                {availableYarns.map(yarn => (
                  <button
                    key={yarn.id}
                    className="project-yarn-pick-card"
                    onClick={() => handleLinkExisting(yarn.id)}
                  >
                    <div className="project-yarn-info">
                      {yarn.brand && <span className="yarn-brand">{yarn.brand}</span>}
                      <h3>{yarn.name}</h3>
                      {yarn.colorName && <span className="yarn-color-name">{yarn.colorName}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setYarnMode(null)}>Cancel</button>
          </div>
        )}

        {yarnMode === 'new' && (
          <div className="project-yarn-new">
            <p className="picker-title">Add new yarn to stash</p>
            <YarnForm
              onSubmit={handleAddNewYarn}
              onCancel={() => setYarnMode(null)}
            />
          </div>
        )}
      </div>}

      <div className="danger-zone">
        {onFinish && (
          <button
            className="btn btn-finish"
            onClick={() => { if (confirm(`Mark "${project.name}" as finished?`)) onFinish() }}
          >
            Mark as Finished
          </button>
        )}
        <button
          className="btn btn-danger btn-sm"
          onClick={() => { if (confirm(`Delete "${project.name}"?`)) onDelete() }}
        >
          Delete Project
        </button>
      </div>
    </div>
  )
}
