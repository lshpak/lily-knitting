import { useState } from 'react'
import { useStorage } from './useStorage'
import { deletePDF } from './pdfStorage'
import ProjectList from './ProjectList'
import ProjectDetail from './ProjectDetail'
import YarnStash from './YarnStash'
import FinishedProjects from './FinishedProjects'
import Stats from './Stats'
import TodoList from './TodoList'
import './styles.css'

const TABS = [
  { id: 'wips', label: 'WIPs', icon: '🧶' },
  { id: 'yarn', label: 'Yarn', icon: '🧵' },
  { id: 'finished', label: 'Done', icon: '🏆' },
  { id: 'todo', label: 'To-Do', icon: '📝' },
  { id: 'stats', label: 'Stats', icon: '📊' },
]

export default function App() {
  const [tab, setTab] = useStorage('lily-tab', 'wips')
  const [projects, setProjects] = useStorage('lily-projects', [])
  const [finished, setFinished] = useStorage('lily-finished', [])
  const [activeId, setActiveId] = useState(null)

  const activeProject = projects.find(p => p.id === activeId)

  function addProject(name, type) {
    const project = {
      id: Date.now().toString(),
      name,
      type: type || '',
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

  function finishProject(id) {
    const project = projects.find(p => p.id === id)
    if (!project) return
    setFinished([{ ...project, finishedAt: new Date().toISOString() }, ...finished])
    setProjects(projects.filter(p => p.id !== id))
    setActiveId(null)
  }

  function switchTab(id) {
    setTab(id)
    setActiveId(null)
  }

  function renderContent() {
    if (tab === 'wips') {
      if (activeProject) {
        return (
          <ProjectDetail
            project={activeProject}
            onUpdate={(updates) => updateProject(activeId, updates)}
            onDelete={() => deleteProject(activeId)}
            onFinish={() => finishProject(activeId)}
            onBack={() => setActiveId(null)}
          />
        )
      }
      return (
        <ProjectList
          projects={projects}
          onSelect={setActiveId}
          onAdd={addProject}
          onDelete={deleteProject}
        />
      )
    }
    if (tab === 'yarn') return <YarnStash projects={projects} />
    if (tab === 'finished') return <FinishedProjects />
    if (tab === 'todo') return <TodoList />
    if (tab === 'stats') return <Stats />
  }

  return (
    <div className="app">
      <header className="header">
        <button className="header-title" onClick={() => switchTab('wips')}>
          Lily Knitting
        </button>
      </header>
      <main className="main">
        {renderContent()}
      </main>
      <nav className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
