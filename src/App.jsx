import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { isFirebaseConfigured } from './firebase'
import { deletePDF } from './pdfStorage'
import ProjectList from './ProjectList'
import ProjectDetail from './ProjectDetail'
import YarnStash from './YarnStash'
import FinishedProjects from './FinishedProjects'
import Stats from './Stats'
import TodoList from './TodoList'
import PatternBank from './PatternBank'
import './styles.css'

const TABS = [
  { id: 'wips', label: 'WIPs', icon: '🧶' },
  { id: 'yarn', label: 'Yarn', icon: '🧵' },
  { id: 'patterns', label: 'Patterns', icon: '📄' },
  { id: 'finished', label: 'Done', icon: '🏆' },
  { id: 'todo', label: 'To-Do', icon: '📝' },
  { id: 'stats', label: 'Stats', icon: '📊' },
]

export default function App() {
  const { user, loading, error, data, updateData, signIn, signOut } = useAuth()
  const [activeId, setActiveId] = useState(null)

  if (loading || !data) {
    return (
      <div className="app">
        <div className="loading-screen">
          <span className="loading-icon">🧶</span>
          {error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    )
  }

  const tab = data.tab || 'wips'
  const projects = data.projects || []
  const finished = data.finished || []
  const yarns = data.yarns || []
  const pastYarns = data.pastYarns || []
  const patterns = data.patterns || []

  function setTab(t) { updateData('tab', t) }
  function setProjects(p) { updateData('projects', typeof p === 'function' ? p(projects) : p) }
  function setFinished(f) { updateData('finished', typeof f === 'function' ? f(finished) : f) }
  function setYarns(y) { updateData('yarns', typeof y === 'function' ? y(yarns) : y) }
  function setPastYarns(py) { updateData('pastYarns', typeof py === 'function' ? py(pastYarns) : py) }
  function setPatterns(p) { updateData('patterns', typeof p === 'function' ? p(patterns) : p) }

  const activeProject = projects.find(p => p.id === activeId)
  const wipProjects = projects.filter(p => p.startedAt)
  const unstartedProjects = projects.filter(p => !p.startedAt)

  function addProject({ name, type, designer, size, patternId, startedAt }) {
    const project = {
      id: Date.now().toString(),
      name,
      type: type || '',
      designer: designer || '',
      size: size || '',
      patternId: patternId || null,
      startedAt: startedAt || null,
      notes: '',
      createdAt: new Date().toISOString(),
    }
    setProjects([project, ...projects])
    return project.id
  }

  function updateProject(id, updates) {
    setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  function deleteProject(id) {
    setProjects(projects.filter(p => p.id !== id))
    setYarns(yarns.map(y => y.projectId === id ? { ...y, projectId: null } : y))
    deletePDF(id)
    if (activeId === id) setActiveId(null)
  }

  function finishProject(id) {
    const project = projects.find(p => p.id === id)
    if (!project) return
    setFinished([{ ...project, finishedAt: new Date().toISOString() }, ...finished])
    setProjects(projects.filter(p => p.id !== id))
    setYarns(yarns.map(y => y.projectId === id ? { ...y, projectId: null } : y))
    setActiveId(null)
  }

  function startProject(id, date) {
    setProjects(projects.map(p => p.id === id ? { ...p, startedAt: date } : p))
    setTab('wips')
    setActiveId(id)
  }

  function addYarn(yarnData) {
    const yarn = {
      id: Date.now().toString(),
      ...yarnData,
    }
    setYarns([yarn, ...yarns])
    return yarn.id
  }

  function updateYarn(id, updates) {
    setYarns(yarns.map(y => y.id === id ? { ...y, ...updates } : y))
  }

  function deleteYarn(id) {
    setYarns(yarns.filter(y => y.id !== id))
  }

  function moveYarnToPast(id) {
    const yarn = yarns.find(y => y.id === id)
    if (!yarn) return
    setPastYarns([{ ...yarn, skeins: 0 }, ...pastYarns])
    setYarns(yarns.filter(y => y.id !== id))
  }

  function restoreYarn(id) {
    const yarn = pastYarns.find(y => y.id === id)
    if (!yarn) return
    setYarns([{ ...yarn, skeins: 1 }, ...yarns])
    setPastYarns(pastYarns.filter(y => y.id !== id))
  }

  function deletePastYarn(id) {
    setPastYarns(pastYarns.filter(y => y.id !== id))
  }

  function switchTab(id) {
    setTab(id)
    setActiveId(null)
  }

  const yarnActions = { addYarn, updateYarn, deleteYarn, moveYarnToPast, restoreYarn, deletePastYarn }

  function renderContent() {
    if (tab === 'wips') {
      if (activeProject) {
        return (
          <ProjectDetail
            project={activeProject}
            yarns={yarns}
            yarnActions={yarnActions}
            bankPatterns={patterns}
            onUpdate={(updates) => updateProject(activeId, updates)}
            onDelete={() => deleteProject(activeId)}
            onFinish={() => finishProject(activeId)}
            onBack={() => setActiveId(null)}
          />
        )
      }
      return (
        <ProjectList
          projects={wipProjects}
          onSelect={setActiveId}
          onAdd={addProject}
          onDelete={deleteProject}
        />
      )
    }
    if (tab === 'patterns') return (
      <PatternBank
        patterns={patterns}
        setPatterns={setPatterns}
        projects={projects}
        onLinkToProject={(patternId, projectId) => updateProject(projectId, { patternId })}
        onCreateProject={(patternId, projectData) => {
          addProject({ ...projectData, patternId })
        }}
      />
    )
    if (tab === 'yarn') return (
      <YarnStash
        projects={projects}
        yarns={yarns}
        pastYarns={pastYarns}
        yarnActions={yarnActions}
      />
    )
    if (tab === 'finished') return <FinishedProjects />
    if (tab === 'todo') return (
      <TodoList
        unstartedProjects={unstartedProjects}
        onAddProject={addProject}
        onStartProject={startProject}
        onDeleteProject={deleteProject}
      />
    )
    if (tab === 'stats') return <Stats />
  }

  return (
    <div className="app">
      <header className="header">
        <button className="header-title" onClick={() => switchTab('wips')}>
          Lily Knitting
        </button>
        <div className="auth-area">
          {error && <span className="auth-error-badge">Sync error</span>}
          {isFirebaseConfigured && (user ? (
            <button className="btn btn-ghost btn-sm auth-btn" onClick={signOut}>
              Sign Out
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm auth-btn" onClick={signIn}>
              Sign In
            </button>
          ))}
        </div>
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
