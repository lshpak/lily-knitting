import { useState, useEffect, useRef } from 'react'
import { savePDF, getPDF, deletePDF } from './pdfStorage'

export default function ProjectDetail({ project, onUpdate, onDelete, onBack }) {
  const [pdf, setPdf] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [showPdf, setShowPdf] = useState(false)
  const fileRef = useRef()

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

  return (
    <div className="project-detail">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        &larr; Projects
      </button>

      <h2 className="project-name">{project.name}</h2>

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
