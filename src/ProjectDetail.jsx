import { useState } from 'react'

export default function ProjectDetail({ project, onUpdate, onDelete, onBack }) {
  const [editingRows, setEditingRows] = useState(false)
  const [totalInput, setTotalInput] = useState(project.totalRows ?? '')

  const progress = project.totalRows
    ? Math.min(100, Math.round((project.rowCount / project.totalRows) * 100))
    : null

  function increment() {
    onUpdate({ rowCount: project.rowCount + 1 })
  }

  function decrement() {
    if (project.rowCount > 0) {
      onUpdate({ rowCount: project.rowCount - 1 })
    }
  }

  function resetCounter() {
    if (confirm('Reset row count to 0?')) {
      onUpdate({ rowCount: 0 })
    }
  }

  function saveTotalRows() {
    const val = totalInput === '' ? null : Math.max(1, parseInt(totalInput, 10) || 0)
    onUpdate({ totalRows: val || null })
    setEditingRows(false)
  }

  return (
    <div className="project-detail">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        &larr; Projects
      </button>

      <h2 className="project-name">{project.name}</h2>

      <div className="counter-section">
        <div className="counter-display">
          <span className="counter-label">Row</span>
          <span className="counter-number">{project.rowCount}</span>
          {project.totalRows && (
            <span className="counter-total">of {project.totalRows}</span>
          )}
        </div>

        {progress !== null && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        <div className="counter-controls">
          <button className="btn btn-counter btn-minus" onClick={decrement} disabled={project.rowCount === 0}>
            &minus;
          </button>
          <button className="btn btn-counter btn-plus" onClick={increment}>
            +
          </button>
        </div>

        <div className="counter-actions">
          <button className="btn btn-ghost btn-sm" onClick={resetCounter}>
            Reset
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditingRows(!editingRows)}>
            {project.totalRows ? 'Edit goal' : 'Set goal'}
          </button>
        </div>

        {editingRows && (
          <div className="goal-form">
            <input
              autoFocus
              type="number"
              min="1"
              placeholder="Total rows"
              value={totalInput}
              onChange={e => setTotalInput(e.target.value)}
              className="input input-sm"
            />
            <button className="btn btn-primary btn-sm" onClick={saveTotalRows}>
              Save
            </button>
            {project.totalRows && (
              <button className="btn btn-ghost btn-sm" onClick={() => { onUpdate({ totalRows: null }); setEditingRows(false) }}>
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <div className="notes-section">
        <label className="notes-label">Notes</label>
        <textarea
          className="notes-input"
          placeholder="Pattern notes, stitch counts, reminders..."
          value={project.notes}
          onChange={e => onUpdate({ notes: e.target.value })}
          rows={6}
        />
      </div>

      <div className="danger-zone">
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
