import { useStorage } from './useStorage'

export default function Stats() {
  const [projects] = useStorage('lily-projects', [])
  const [finished] = useStorage('lily-finished', [])
  const [yarns] = useStorage('lily-yarns', [])
  const [todos] = useStorage('lily-todos', [])

  const wipCount = projects.length
  const finishedCount = finished.length
  const totalProjects = wipCount + finishedCount
  const yarnCount = yarns.length
  const todoDone = todos.filter(t => t.done).length
  const todoTotal = todos.length

  return (
    <div className="stats-page">
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-number">{wipCount}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{finishedCount}</span>
          <span className="stat-label">Finished</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalProjects}</span>
          <span className="stat-label">Total Projects</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{yarnCount}</span>
          <span className="stat-label">Yarns in Stash</span>
        </div>
      </div>

      {todoTotal > 0 && (
        <div className="stat-section">
          <h3 className="section-label">To-Do Progress</h3>
          <div className="stat-bar-container">
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{ width: `${todoTotal ? Math.round((todoDone / todoTotal) * 100) : 0}%` }}
              />
            </div>
            <span className="stat-bar-text">{todoDone} / {todoTotal} done</span>
          </div>
        </div>
      )}

      {finished.length > 0 && (
        <div className="stat-section">
          <h3 className="section-label">Recently Finished</h3>
          <div className="items">
            {finished.slice(0, 5).map(p => (
              <div key={p.id} className="item-card">
                <div className="item-card-info">
                  <h3>{p.name}</h3>
                  <span className="item-card-meta">
                    {p.finishedAt ? new Date(p.finishedAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalProjects === 0 && yarnCount === 0 && todoTotal === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No stats yet</p>
          <p className="subtle">Start adding projects, yarn, and to-dos to see your stats</p>
        </div>
      )}
    </div>
  )
}
