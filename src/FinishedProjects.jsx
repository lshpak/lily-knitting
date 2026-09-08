import { useState } from 'react'
import ProjectDetail from './ProjectDetail'

export default function FinishedProjects({ finished, setFinished, bankPatterns = [], onAddPattern }) {
  const [activeId, setActiveId] = useState(null)

  const activeProject = finished.find(p => p.id === activeId)

  function updateProject(id, updates) {
    setFinished(finished.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  function deleteProject(id) {
    if (confirm('Delete this finished project?')) {
      setFinished(finished.filter(p => p.id !== id))
      if (activeId === id) setActiveId(null)
    }
  }

  if (activeProject) {
    return (
      <ProjectDetail
        project={activeProject}
        bankPatterns={bankPatterns}
        onUpdate={(updates) => updateProject(activeId, updates)}
        onDelete={() => deleteProject(activeId)}
        onBack={() => setActiveId(null)}
        onAddPattern={onAddPattern}
      />
    )
  }

  return (
    <div className="section-list">
      {finished.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-text">✓</div>
          <p>No finished projects</p>
          <p className="subtle">Mark a WIP as finished and it will show up here</p>
        </div>
      )}

      <div className="items">
        {finished.map(project => (
          <div key={project.id} className="item-card" onClick={() => setActiveId(project.id)}>
            <div className="item-card-info">
              <h3>{project.name}</h3>
              <span className="item-card-meta">
                {project.finishedAt ? `Finished ${new Date(project.finishedAt).toLocaleDateString()}` : ''}
              </span>
            </div>
            <button
              className="btn btn-ghost btn-sm delete-btn"
              onClick={(e) => { e.stopPropagation(); deleteProject(project.id) }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
