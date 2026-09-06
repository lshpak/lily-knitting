import { useState } from 'react'

export default function ProjectList({ projects, onSelect, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [designer, setDesigner] = useState('')
  const [size, setSize] = useState('')
  const [showInput, setShowInput] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, type: type.trim(), designer: designer.trim(), size: size.trim() })
    setName('')
    setType('')
    setDesigner('')
    setSize('')
    setShowInput(false)
  }

  return (
    <div className="project-list">
      {!showInput ? (
        <button className="btn btn-primary add-btn" onClick={() => setShowInput(true)}>
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
            <button type="button" className="btn btn-ghost" onClick={() => { setShowInput(false); setName(''); setType(''); setDesigner(''); setSize('') }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 && !showInput && (
        <div className="empty-state">
          <div className="empty-icon">🧶</div>
          <p>No projects yet</p>
          <p className="subtle">Tap "New Project" to start tracking your knitting</p>
        </div>
      )}

      <div className="projects">
        {projects.map(project => (
          <div key={project.id} className="project-card" onClick={() => onSelect(project.id)}>
            <div className="project-card-info">
              <h3>{project.name}</h3>
              {(project.type || project.designer || project.size) && (
                <span className="project-card-type">
                  {[project.type, project.designer ? `by ${project.designer}` : '', project.size ? `Size ${project.size}` : ''].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
            <button
              className="btn btn-ghost btn-sm delete-btn"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm(`Delete "${project.name}"?`)) onDelete(project.id)
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
