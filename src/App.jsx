import { useState } from 'react'
import { useStorage } from './useStorage'
import { deletePDF } from './pdfStorage'
import ProjectList from './ProjectList'
import ProjectDetail from './ProjectDetail'
import './styles.css'

export default function App() {
  const [projects, setProjects] = useStorage('lily-projects', [])
  const [activeId, setActiveId] = useState(null)

  const activeProject = projects.find(p => p.id === activeId)

  function addProject(name) {
    const project = {
      id: Date.now().toString(),
      name,
      rowCount: 0,
      totalRows: null,
      notes: '',
      createdAt: new Date().toISOString(),
    }
    setProjects([project, ...projects])
    setActiveId(project.id)
  }

  function updateProject(id, updates) {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  function deleteProject(id) {
    setProjects(projects.filter(p => p.id !== id))
    deletePDF(id)
    if (activeId === id) setActiveId(null)
  }

  return (
    <div className="app">
      <header className="header">
        <button
          className="header-title"
          onClick={() => setActiveId(null)}
        >
          Lily Knitting
        </button>
      </header>
      <main className="main">
        {activeProject ? (
          <ProjectDetail
            project={activeProject}
            onUpdate={(updates) => updateProject(activeId, updates)}
            onDelete={() => deleteProject(activeId)}
            onBack={() => setActiveId(null)}
          />
        ) : (
          <ProjectList
            projects={projects}
            onSelect={setActiveId}
            onAdd={addProject}
            onDelete={deleteProject}
          />
        )}
      </main>
    </div>
  )
}
