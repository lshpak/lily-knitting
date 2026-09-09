import { useState, useRef, useEffect } from 'react'
import { pickFromDrive, getDrivePreviewUrl } from './googleDrive'

export default function PatternBank({ patterns, setPatterns, projects = [], onLinkToProject, onCreateProject }) {
  const [viewingId, setViewingId] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [linkingId, setLinkingId] = useState(null)
  const [creatingFor, setCreatingFor] = useState(null)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('')
  const [newDesigner, setNewDesigner] = useState('')
  const [newSize, setNewSize] = useState('')
  const [picking, setPicking] = useState(false)
  const [menuOpen, setMenuOpen] = useState(null)
  const [editingWeightId, setEditingWeightId] = useState(null)
  const [weightInput, setWeightInput] = useState('')
  const [weightFilter, setWeightFilter] = useState(null)
  const [writingPattern, setWritingPattern] = useState(false)
  const [writeTitle, setWriteTitle] = useState('')
  const [writeContent, setWriteContent] = useState('')
  const [editingContentId, setEditingContentId] = useState(null)
  const [editContent, setEditContent] = useState('')
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleDrivePick() {
    setPicking(true)
    try {
      const result = await pickFromDrive()
      if (!result) return
      const id = Date.now().toString()
      setPatterns([
        {
          id,
          fileName: result.fileName,
          addedAt: new Date().toISOString(),
          source: 'drive',
          driveFileId: result.driveFileId,
        },
        ...patterns,
      ])
    } catch (err) {
      alert('Google Drive: ' + err.message)
    } finally {
      setPicking(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this pattern?')) return
    setPatterns(patterns.filter(p => p.id !== id))
    if (viewingId === id) closeViewer()
    if (linkingId === id) setLinkingId(null)
    if (creatingFor === id) setCreatingFor(null)
  }

  function closeViewer() {
    setViewingId(null)
    setPdfUrl(null)
  }

  function handleView(id) {
    if (viewingId === id) {
      closeViewer()
      return
    }
    const pattern = patterns.find(p => p.id === id)
    if (pattern?.source === 'written') {
      handleViewWritten(id)
    } else if (pattern?.driveFileId) {
      setPdfUrl(getDrivePreviewUrl(pattern.driveFileId))
      setViewingId(id)
    }
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

  function getUnlinkedProjects() {
    return projects.filter(p => !p.patternId && !p.finishedAt)
  }

  function handleEditWeight(id) {
    const pattern = patterns.find(p => p.id === id)
    setWeightInput(pattern?.yarnWeight || '')
    setEditingWeightId(id)
    setMenuOpen(null)
  }

  function saveWeight(id) {
    setPatterns(patterns.map(p => p.id === id ? { ...p, yarnWeight: weightInput.trim() || null } : p))
    setEditingWeightId(null)
    setWeightInput('')
  }

  function handleWritePattern(e) {
    e.preventDefault()
    const title = writeTitle.trim()
    const content = writeContent.trim()
    if (!title || !content) return
    const id = Date.now().toString()
    setPatterns([
      {
        id,
        fileName: title,
        addedAt: new Date().toISOString(),
        source: 'written',
        content,
      },
      ...patterns,
    ])
    setWriteTitle('')
    setWriteContent('')
    setWritingPattern(false)
  }

  function handleEditContent(id) {
    const pattern = patterns.find(p => p.id === id)
    setEditContent(pattern?.content || '')
    setEditingContentId(id)
    setViewingId(null)
    setMenuOpen(null)
  }

  function saveContent(id) {
    setPatterns(patterns.map(p => p.id === id ? { ...p, content: editContent } : p))
    setEditingContentId(null)
    setEditContent('')
  }

  function handleViewWritten(id) {
    if (viewingId === id) {
      closeViewer()
      return
    }
    setViewingId(id)
    setPdfUrl(null)
  }

  const weights = [...new Set(patterns.map(p => p.yarnWeight).filter(Boolean))].sort()
  const filteredPatterns = weightFilter
    ? patterns.filter(p => p.yarnWeight === weightFilter)
    : patterns

  return (
    <div className="section-list">
      <div className="pattern-add-actions">
        <button
          className="btn btn-primary add-btn"
          onClick={handleDrivePick}
          disabled={picking}
        >
          {picking ? 'Opening...' : 'Add from Google Drive'}
        </button>
        <button
          className="btn btn-outline add-btn"
          onClick={() => setWritingPattern(!writingPattern)}
        >
          Write a Pattern
        </button>
      </div>

      {writingPattern && (
        <form className="write-pattern-form" onSubmit={handleWritePattern}>
          <input
            autoFocus
            type="text"
            className="input"
            placeholder="Pattern title..."
            value={writeTitle}
            onChange={e => setWriteTitle(e.target.value)}
          />
          <textarea
            className="write-pattern-content"
            placeholder="Write your pattern instructions here..."
            value={writeContent}
            onChange={e => setWriteContent(e.target.value)}
            rows={10}
          />
          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={!writeTitle.trim() || !writeContent.trim()}>
              Save Pattern
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setWritingPattern(false); setWriteTitle(''); setWriteContent('') }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {weights.length > 1 && (
        <div className="filter-chips">
          <button
            className={`filter-chip ${!weightFilter ? 'filter-chip-active' : ''}`}
            onClick={() => setWeightFilter(null)}
          >
            All
          </button>
          {weights.map(w => (
            <button
              key={w}
              className={`filter-chip ${weightFilter === w ? 'filter-chip-active' : ''}`}
              onClick={() => setWeightFilter(weightFilter === w ? null : w)}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {patterns.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-text">—</div>
          <p>No patterns yet</p>
          <p className="subtle">Add patterns from Google Drive to build your library</p>
        </div>
      )}

      {filteredPatterns.length > 0 && (
        <div className="items">
          {filteredPatterns.map(p => {
            const linkedProjects = projects.filter(pr => pr.patternId === p.id)
            const available = getUnlinkedProjects()

            return (
              <div key={p.id}>
                <div className="bank-card" onClick={() => handleView(p.id)}>
                  <div className="bank-card-left">
                    <div className="bank-card-info">
                      <h3>{p.fileName}</h3>
                      <span className="item-card-meta">
                        {new Date(p.addedAt).toLocaleDateString()}
                        {p.yarnWeight && <> · {p.yarnWeight}</>}
                      </span>
                      {linkedProjects.length > 0 && (
                        <span className="bank-linked-projects">
                          {linkedProjects.map(pr => pr.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bank-card-actions" ref={menuOpen === p.id ? menuRef : null} onClick={e => e.stopPropagation()}>
                    <button
                      className="btn btn-ghost btn-sm dots-btn"
                      onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                    >
                      &#x22EE;
                    </button>
                    {menuOpen === p.id && (
                      <div className="dots-menu">
                        <button onClick={() => { handleLinkClick(p.id); setMenuOpen(null) }}>
                          Link to Project
                        </button>
                        <button onClick={() => { handleCreateClick(p.id); setMenuOpen(null) }}>
                          New Project
                        </button>
                        {p.source === 'written' && (
                          <button onClick={() => handleEditContent(p.id)}>
                            Edit Pattern
                          </button>
                        )}
                        <button onClick={() => handleEditWeight(p.id)}>
                          {p.yarnWeight ? 'Edit Yarn Weight' : 'Set Yarn Weight'}
                        </button>
                        <button className="dots-menu-danger" onClick={() => { handleDelete(p.id); setMenuOpen(null) }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {viewingId === p.id && pdfUrl && (
                  <div className="pdf-viewer bank-pdf-viewer">
                    <iframe src={pdfUrl} title={p.fileName} />
                  </div>
                )}

                {viewingId === p.id && p.source === 'written' && !pdfUrl && (
                  <div className="written-pattern-viewer">
                    <pre className="written-pattern-text">{p.content}</pre>
                  </div>
                )}

                {editingWeightId === p.id && (
                  <div className="bank-weight-edit">
                    <input
                      autoFocus
                      type="text"
                      className="input input-sm"
                      placeholder="Yarn weight (DK, Worsted, Bulky...)"
                      value={weightInput}
                      onChange={e => setWeightInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveWeight(p.id) }}
                    />
                    <button className="btn btn-primary btn-sm" onClick={() => saveWeight(p.id)}>Save</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingWeightId(null)}>Cancel</button>
                  </div>
                )}

                {editingContentId === p.id && (
                  <div className="write-pattern-form">
                    <textarea
                      autoFocus
                      className="write-pattern-content"
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={10}
                    />
                    <div className="form-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => saveContent(p.id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingContentId(null)}>Cancel</button>
                    </div>
                  </div>
                )}

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
