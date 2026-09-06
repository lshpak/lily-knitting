import { useState } from 'react'

export default function TodoList({ unstartedProjects = [], onAddProject, onStartProject, onDeleteProject }) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [designer, setDesigner] = useState('')
  const [size, setSize] = useState('')
  const [startingId, setStartingId] = useState(null)
  const [startDate, setStartDate] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAddProject({ name: trimmed, type: type.trim(), designer: designer.trim(), size: size.trim() })
    setName('')
    setType('')
    setDesigner('')
    setSize('')
    setShowForm(false)
  }

  function todayStr() {
    return new Date().toISOString().split('T')[0]
  }

  function handleStartClick(id) {
    setStartDate(todayStr())
    setStartingId(id)
  }

  function confirmStart(id) {
    if (startDate) {
      onStartProject(id, startDate)
    }
    setStartingId(null)
    setStartDate('')
  }

  return (
    <div className="section-list">
      {!showForm ? (
        <button className="btn btn-primary add-btn" onClick={() => setShowForm(true)}>
          + New Project
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="new-project-form">
          <input
            autoFocus
            type="text"
            placeholder="Project name..."
            value={name}
            onChange={e => setName(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Type (sweater, scarf, hat, socks...)"
            value={type}
            onChange={e => setType(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Pattern designer"
            value={designer}
            onChange={e => setDesigner(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Size (S, M, L, 40in chest...)"
            value={size}
            onChange={e => setSize(e.target.value)}
            className="input"
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Create
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setName(''); setType(''); setDesigner(''); setSize('') }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {unstartedProjects.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>No upcoming projects</p>
          <p className="subtle">Add a project to plan your next knit</p>
        </div>
      )}

      {unstartedProjects.length > 0 && (
        <div className="items">
          {unstartedProjects.map(p => (
            <div key={p.id} className="project-card">
              <div className="project-card-info">
                {p.type && <span className="project-tag">{p.type}</span>}
                <h3>{p.name}</h3>
                {(p.designer || p.size) && (
                  <span className="project-card-meta">
                    {[p.designer ? `by ${p.designer}` : '', p.size ? `Size ${p.size}` : ''].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
              <div className="project-card-actions">
                {startingId === p.id ? (
                  <div className="start-date-picker">
                    <input
                      type="date"
                      className="input input-sm"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => confirmStart(p.id)}>
                      Go
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setStartingId(null)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStartClick(p.id)}>
                    Start
                  </button>
                )}
                <button
                  className="btn btn-ghost btn-sm delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete "${p.name}"?`)) onDeleteProject(p.id)
                  }}
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
