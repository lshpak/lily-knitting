export default function ProjectList({ projects, onSelect, onDelete }) {
  return (
    <div className="project-list">
      {projects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-text">○</div>
          <p>No projects yet</p>
          <p className="subtle">Tap + to start a new project</p>
        </div>
      )}

      <div className="projects">
        {projects.map(project => (
          <div key={project.id} className="project-card" onClick={() => onSelect(project.id)}>
            <div className="project-card-info">
              {project.type && <span className="project-tag">{project.type}</span>}
              <h3>{project.name}</h3>
              {(project.designer || project.size) && (
                <span className="project-card-meta">
                  {[project.designer ? `by ${project.designer}` : '', project.size ? `Size ${project.size}` : ''].filter(Boolean).join(' · ')}
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
