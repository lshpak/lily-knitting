import { useState, useRef } from 'react'
import { saveBankPattern, getBankPattern, deleteBankPattern } from './pdfStorage'

export default function PatternBank({ patterns, setPatterns, projects = [], onLinkToProject, onCreateProject }) {
  const [viewingId, setViewingId] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [linkingId, setLinkingId] = useState(null)
  const [creatingFor, setCreatingFor] = useState(null)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('')
  const [newDesigner, setNewDesigner] = useState('')
  const [newSize, setNewSize] = useState('')
  const fileRef = useRef()

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const id = Date.now().toString()
    await saveBankPattern(id, file)
    setPatterns([
      { id, fileName: file.name, addedAt: new Date().toISOString() },
      ...patterns,
    ])
    fileRef.current.value = ''
  }

  async function handleDelete(id) {
    if (!confirm('Delete this pattern?')) return
    await deleteBankPattern(id)
    setPatterns(patterns.filter(p => p.id !== id))
    if (viewingId === id) closeViewer()
    if (linkingId === id) setLinkingId(null)
    if (creatingFor === id) setCreatingFor(null)
  }

  function closeViewer() {
    setViewingId(null)
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
  }

  async function handleView(id) {
    if (viewingId === id) {
      closeViewer()
      return
    }
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    const result = await getBankPattern(id)
    if (!result) return
    const url = URL.createObjectURL(result.blob)
    setPdfUrl(url)
    setViewingId(id)
  }

  function handleLinkClick(patternId) {
    setLinkingId(linkingId === patternId ? null : patternId)
    setCreatingFor(null)
  }

  function handleCreateClick(patternId) {
    setCreatingFor(creatingFor === patternId ? null : patternId)
    setLinkingId(null)
    setNewName('')
    setNewType('')
    setNewDesigner('')
    setNewSize('')
  }

  function handlePickProject(patternId, projectId) {
    onLinkToProject(patternId, projectId)
    setLinkingId(null)
  }

  function handleCreateSubmit(e, patternId) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    onCreateProject(patternId, {
      name: trimmed,
      type: newType.trim(),
      designer: newDesigner.trim(),
      size: newSize.trim(),
    })
    setCreatingFor(null)
  }

  function getUnlinkedProjects(patternId) {
    return projects.filter(p => !p.patternId && !p.finishedAt)
  }

  return (
    <div className="section-list">
      <label className="btn btn-primary add-btn">
        Upload Pattern PDF
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          hidden
        />
      </label>

      {patterns.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <p>No patterns yet</p>
          <p className="subtle">Upload PDF patterns to build your library</p>
        </div>
      )}

      {patterns.length > 0 && (
        <div className="items">
          {patterns.map(p => {
            const linkedProjects = projects.filter(pr => pr.patternId === p.id)
            const available = getUnlinkedProjects(p.id)

            return (
              <div key={p.id}>
                <div className="bank-card">
                  <div className="bank-card-left">
                    <span className="pattern-icon">PDF</span>
                    <div className="bank-card-info">
                      <h3>{p.fileName}</h3>
                      <span className="item-card-meta">
                        {new Date(p.addedAt).toLocaleDateString()}
                      </span>
                      {linkedProjects.length > 0 && (
                        <span className="bank-linked-projects">
                          {linkedProjects.map(pr => pr.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bank-card-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleView(p.id)}
                    >
                      {viewingId === p.id ? 'Hide' : 'View'}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {viewingId === p.id && pdfUrl && (
                  <div className="pdf-viewer bank-pdf-viewer">
                    <iframe src={pdfUrl} title={p.fileName} />
                  </div>
                )}

                <div className="bank-link-row">
                  <button
                    className={`btn btn-ghost btn-sm ${linkingId === p.id ? 'tab-active' : ''}`}
                    onClick={() => handleLinkClick(p.id)}
                  >
                    Link to Project
                  </button>
                  <button
                    className={`btn btn-ghost btn-sm ${creatingFor === p.id ? 'tab-active' : ''}`}
                    onClick={() => handleCreateClick(p.id)}
                  >
                    New Project
                  </button>
                </div>

                {linkingId === p.id && (
                  <div className="bank-picker">
                    {available.length === 0 ? (
                      <p className="yarn-link-empty">No projects without a pattern</p>
                    ) : (
                      <div className="items">
                        {available.map(pr => (
                          <button
                            key={pr.id}
                            className="project-yarn-pick-card"
                            onClick={() => handlePickProject(p.id, pr.id)}
                          >
                            <div className="project-yarn-info">
                              {pr.type && <span className="project-tag">{pr.type}</span>}
                              <h3>{pr.name}</h3>
                              {pr.designer && <span className="yarn-meta-inline">by {pr.designer}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {creatingFor === p.id && (
                  <form className="bank-new-project" onSubmit={(e) => handleCreateSubmit(e, p.id)}>
                    <input
                      autoFocus
                      type="text"
                      className="input"
                      placeholder="Project name..."
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Type (sweater, scarf, hat...)"
                      value={newType}
                      onChange={e => setNewType(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Pattern designer"
                      value={newDesigner}
                      onChange={e => setNewDesigner(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="Size (S, M, L, 40in chest...)"
                      value={newSize}
                      onChange={e => setNewSize(e.target.value)}
                    />
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={!newName.trim()}>
                        Create
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCreatingFor(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
