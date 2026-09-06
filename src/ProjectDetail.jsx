import { useState, useEffect, useRef } from 'react'
import { savePDF, getPDF, deletePDF } from './pdfStorage'
import YarnForm from './YarnForm'

export default function ProjectDetail({ project, yarns = [], yarnActions, onUpdate, onDelete, onFinish, onBack }) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(project.name)
  const [editType, setEditType] = useState(project.type || '')
  const [pdf, setPdf] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [showPdf, setShowPdf] = useState(false)
  const [yarnMode, setYarnMode] = useState(null)
  const fileRef = useRef()

  const linkedYarns = yarns.filter(y => y.projectId === project.id)
  const availableYarns = yarns.filter(y => !y.projectId)

  function startEditing() {
    setEditName(project.name)
    setEditType(project.type || '')
    setEditing(true)
  }

  function saveEdit() {
    const trimmed = editName.trim()
    if (!trimmed) return
    onUpdate({ name: trimmed, type: editType.trim() })
    setEditing(false)
  }

  useEffect(() => {
    getPDF(project.id).then(result => {
      setPdf(result)
      setShowPdf(false)
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    })
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl) }
  }, [project.id])

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    await savePDF(project.id, file)
    setPdf({ name: file.name, blob: file })
    setShowPdf(false)
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
    fileRef.current.value = ''
  }

  async function handleRemovePdf() {
    if (!confirm('Remove pattern PDF?')) return
    await deletePDF(project.id)
    setPdf(null)
    setShowPdf(false)
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(null)
  }

  function handleViewPdf() {
    if (showPdf) {
      setShowPdf(false)
      return
    }
    if (!pdfUrl && pdf) {
      setPdfUrl(URL.createObjectURL(pdf.blob))
    }
    setShowPdf(true)
  }

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

  function useSkein(yarnId) {
    const yarn = yarns.find(y => y.id === yarnId)
    if (!yarn || getSkeins(yarn) <= 0) return
    yarnActions.updateYarn(yarnId, {
      skeins: getSkeins(yarn) - 1,
      skeinsUsed: (yarn.skeinsUsed || 0) + 1,
    })
  }

  function returnSkein(yarnId) {
    const yarn = yarns.find(y => y.id === yarnId)
    if (!yarn || (yarn.skeinsUsed || 0) <= 0) return
    yarnActions.updateYarn(yarnId, {
      skeins: getSkeins(yarn) + 1,
      skeinsUsed: (yarn.skeinsUsed || 0) - 1,
    })
  }

  function getSkeins(yarn) {
    return typeof yarn.skeins === 'number' ? yarn.skeins : (parseInt(yarn.skeins, 10) || 0)
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
          <div className="form-actions">
            <button className="btn btn-primary btn-sm" onClick={saveEdit} disabled={!editName.trim()}>Save</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="project-header">
          <div>
            <h2 className="project-name">{project.name}</h2>
            {project.type && <span className="project-type">{project.type}</span>}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={startEditing}>Edit</button>
        </div>
      )}

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
                        className="btn btn-skein"
                        onClick={() => returnSkein(yarn.id)}
                        disabled={used === 0}
                      >
                        &minus;
                      </button>
                      <span className="yarn-skein-count">
                        {used} used
                      </span>
                      <button
                        className="btn btn-skein"
                        onClick={() => useSkein(yarn.id)}
                        disabled={remaining === 0}
                      >
                        +
                      </button>
                    </div>
                    <span className="yarn-remaining">{remaining} left in stash</span>
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

      <div className="pattern-section">
        <label className="section-label">Pattern</label>
        {pdf ? (
          <div className="pattern-attached">
            <div className="pattern-info">
              <span className="pattern-icon">PDF</span>
              <span className="pattern-name">{pdf.name}</span>
            </div>
            <div className="pattern-actions">
              <button className="btn btn-primary btn-sm" onClick={handleViewPdf}>
                {showPdf ? 'Hide' : 'View'}
              </button>
              <label className="btn btn-ghost btn-sm">
                Replace
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  hidden
                />
              </label>
              <button className="btn btn-danger btn-sm" onClick={handleRemovePdf}>
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="btn btn-outline upload-btn">
            Upload Pattern PDF
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              hidden
            />
          </label>
        )}
        {showPdf && pdfUrl && (
          <div className="pdf-viewer">
            <iframe src={pdfUrl} title="Pattern PDF" />
          </div>
        )}
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
