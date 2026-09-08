export default function Stats({ projects = [], finished = [], yarns = [] }) {
  const allProjects = [...projects, ...finished]
  const wipCount = projects.length
  const finishedCount = finished.length
  const totalProjects = allProjects.length
  const yarnCount = yarns.length

  const totalSeconds = allProjects.reduce((sum, p) => sum + (p.totalSeconds || 0), 0)

  const projectsWithTime = allProjects.filter(p => p.totalSeconds > 0)
  const longest = projectsWithTime.length > 0
    ? projectsWithTime.reduce((a, b) => (a.totalSeconds || 0) > (b.totalSeconds || 0) ? a : b)
    : null
  const quickest = projectsWithTime.length > 0
    ? projectsWithTime.reduce((a, b) => (a.totalSeconds || 0) < (b.totalSeconds || 0) ? a : b)
    : null

  const yarnByProject = {}
  for (const y of yarns) {
    if (y.projectId && y.skeinsUsed > 0) {
      yarnByProject[y.projectId] = (yarnByProject[y.projectId] || 0) + y.skeinsUsed
    }
  }
  const projectsWithYarn = Object.entries(yarnByProject)
  const mostYarnEntry = projectsWithYarn.length > 0
    ? projectsWithYarn.reduce((a, b) => a[1] > b[1] ? a : b)
    : null
  const leastYarnEntry = projectsWithYarn.length > 0
    ? projectsWithYarn.reduce((a, b) => a[1] < b[1] ? a : b)
    : null
  const mostYarnProject = mostYarnEntry ? allProjects.find(p => p.id === mostYarnEntry[0]) : null
  const leastYarnProject = leastYarnEntry ? allProjects.find(p => p.id === leastYarnEntry[0]) : null

  function formatTotalTime(sec) {
    if (!sec) return '0m'
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    if (m > 0) return `${m}m`
    return '<1m'
  }

  function formatSkeins(n) {
    return n % 1 === 0 ? n.toString() : n.toFixed(2).replace(/0$/, '')
  }

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

      {totalSeconds > 0 && (
        <div className="stat-section">
          <h3 className="section-label">Knitting Time</h3>
          <div className="stat-highlight">
            <span className="stat-highlight-number">{formatTotalTime(totalSeconds)}</span>
            <span className="stat-highlight-label">Total time knitting</span>
          </div>
          {longest && quickest && longest.id !== quickest.id && (
            <div className="stat-list">
              <div className="stat-list-item">
                <span className="stat-list-label">Longest project</span>
                <span className="stat-list-value">{longest.name}</span>
                <span className="stat-list-meta">{formatTotalTime(longest.totalSeconds)}</span>
              </div>
              <div className="stat-list-item">
                <span className="stat-list-label">Quickest project</span>
                <span className="stat-list-value">{quickest.name}</span>
                <span className="stat-list-meta">{formatTotalTime(quickest.totalSeconds)}</span>
              </div>
            </div>
          )}
          {longest && quickest && longest.id === quickest.id && (
            <div className="stat-list">
              <div className="stat-list-item">
                <span className="stat-list-label">Only timed project</span>
                <span className="stat-list-value">{longest.name}</span>
                <span className="stat-list-meta">{formatTotalTime(longest.totalSeconds)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {projectsWithYarn.length > 0 && (
        <div className="stat-section">
          <h3 className="section-label">Yarn Usage</h3>
          <div className="stat-list">
            {mostYarnProject && (
              <div className="stat-list-item">
                <span className="stat-list-label">Most yarn used</span>
                <span className="stat-list-value">{mostYarnProject.name}</span>
                <span className="stat-list-meta">{formatSkeins(mostYarnEntry[1])} skeins</span>
              </div>
            )}
            {leastYarnProject && mostYarnProject && leastYarnProject.id !== mostYarnProject.id && (
              <div className="stat-list-item">
                <span className="stat-list-label">Least yarn used</span>
                <span className="stat-list-value">{leastYarnProject.name}</span>
                <span className="stat-list-meta">{formatSkeins(leastYarnEntry[1])} skeins</span>
              </div>
            )}
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

      {totalProjects === 0 && yarnCount === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <p>No stats yet</p>
          <p className="subtle">Start adding projects and yarn to see your stats</p>
        </div>
      )}
    </div>
  )
}
