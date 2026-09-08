import { useState, useEffect, useRef } from 'react'
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
import { WipsIcon, YarnIcon, PatternsIcon, DoneIcon, TodoIcon, StatsIcon } from './Icons'
import './styles.css'

function NewProjectForm({ onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [designer, setDesigner] = useState('')
  const [size, setSize] = useState('')
  const [startedAt, setStartedAt] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, type: type.trim(), designer: designer.trim(), size: size.trim(), startedAt: startedAt || null })
  }

  return (
    <div className="overlay" onClick={onCancel}>
      <form className="overlay-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="overlay-title">New Project</h2>
        <input autoFocus type="text" placeholder="Project name..." value={name} onChange={e => setName(e.target.value)} className="input" />
        <input type="text" placeholder="Type (sweater, scarf, hat...)" value={type} onChange={e => setType(e.target.value)} className="input" />
        <input type="text" placeholder="Pattern designer" value={designer} onChange={e => setDesigner(e.target.value)} className="input" />
        <input type="text" placeholder="Size (S, M, L, 40in chest...)" value={size} onChange={e => setSize(e.target.value)} className="input" />
        <input type="date" value={startedAt} onChange={e => setStartedAt(e.target.value)} className="input" placeholder="Start date (optional)" />
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={!name.trim()}>Create</button>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

const TABS = [
  { id: 'wips', label: 'WIPs', Icon: WipsIcon },
  { id: 'todo', label: 'To-Do', Icon: TodoIcon },
  { id: 'finished', label: 'Done', Icon: DoneIcon },
  { id: 'patterns', label: 'Patterns', Icon: PatternsIcon },
  { id: 'yarn', label: 'Yarn', Icon: YarnIcon },
  { id: 'stats', label: 'Stats', Icon: StatsIcon },
]

export default function App() {
  const { user, loading, error, data, updateData, signIn, signOut } = useAuth()
  const [activeId, setActiveId] = useState(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [globalTimer, setGlobalTimer] = useState({ running: false, paused: false, projectId: null, seconds: 0, picking: false, saving: false })
  const globalIntervalRef = useRef(null)

  useEffect(() => {
    if (globalTimer.running && !globalTimer.paused) {
      globalIntervalRef.current = setInterval(() => {
        setGlobalTimer(t => ({ ...t, seconds: t.seconds + 1 }))
      }, 1000)
    } else {
      clearInterval(globalIntervalRef.current)
    }
    return () => clearInterval(globalIntervalRef.current)
  }, [globalTimer.running, globalTimer.paused])

  if (loading || !data) {
    return (
      <div className="app">
        <div className="loading-screen">
          <WipsIcon className="loading-icon-svg" />
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

  const today = new Date().toISOString().split('T')[0]
  const activeProject = projects.find(p => p.id === activeId)
  const wipProjects = projects.filter(p => p.startedAt && p.startedAt <= today)
  const unstartedProjects = projects.filter(p => !p.startedAt || p.startedAt > today)

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

  function formatGlobalTime(totalSec) {
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function startGlobalTimer(projectId) {
    setGlobalTimer({ running: true, paused: false, projectId, seconds: 0, picking: false, saving: false })
  }

  function stopGlobalTimer() {
    clearInterval(globalIntervalRef.current)
    if (globalTimer.seconds > 0) {
      setGlobalTimer(t => ({ ...t, running: false, paused: false, saving: true }))
    } else {
      setGlobalTimer({ running: false, paused: false, projectId: null, seconds: 0, picking: false, saving: false })
    }
  }

  function saveGlobalSession() {
    const proj = projects.find(p => p.id === globalTimer.projectId)
    if (proj) {
      updateProject(globalTimer.projectId, { totalSeconds: (proj.totalSeconds || 0) + globalTimer.seconds })
    }
    setGlobalTimer({ running: false, paused: false, projectId: null, seconds: 0, picking: false, saving: false })
  }

  function discardGlobalSession() {
    setGlobalTimer({ running: false, paused: false, projectId: null, seconds: 0, picking: false, saving: false })
  }

  const globalTimerProject = globalTimer.projectId ? projects.find(p => p.id === globalTimer.projectId) : null

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
            onAddPattern={(pattern) => setPatterns([pattern, ...patterns])}
          />
        )
      }
      return (
        <ProjectList
          projects={wipProjects}
          onSelect={setActiveId}
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
    if (tab === 'finished') return (
      <FinishedProjects
        finished={finished}
        setFinished={setFinished}
        bankPatterns={patterns}
        onAddPattern={(pattern) => setPatterns([pattern, ...patterns])}
      />
    )
    if (tab === 'todo') return (
      <TodoList
        unstartedProjects={unstartedProjects}
        onAddProject={addProject}
        onStartProject={startProject}
        onDeleteProject={deleteProject}
      />
    )
    if (tab === 'stats') return <Stats projects={projects} finished={finished} yarns={yarns} />
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
      {showNewProject && (
        <NewProjectForm
          onAdd={(projectData) => {
            const id = addProject(projectData)
            setShowNewProject(false)
            if (projectData.startedAt && projectData.startedAt <= today) {
              setTab('wips')
              setActiveId(id)
            } else {
              setTab('todo')
            }
          }}
          onCancel={() => setShowNewProject(false)}
        />
      )}
      {globalTimer.picking && (
        <div className="overlay" onClick={() => setGlobalTimer(t => ({ ...t, picking: false }))}>
          <div className="overlay-form" onClick={e => e.stopPropagation()}>
            <h2 className="overlay-title">Start Timer</h2>
            <p className="subtle" style={{ marginBottom: 8 }}>Pick a project to time</p>
            {wipProjects.length === 0 ? (
              <p className="yarn-link-empty">No WIPs to time</p>
            ) : (
              <div className="items">
                {wipProjects.map(p => (
                  <button
                    key={p.id}
                    className="project-yarn-pick-card"
                    onClick={() => startGlobalTimer(p.id)}
                  >
                    <div className="project-yarn-info">
                      {p.type && <span className="project-tag">{p.type}</span>}
                      <h3>{p.name}</h3>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setGlobalTimer(t => ({ ...t, picking: false }))}>Cancel</button>
          </div>
        </div>
      )}

      {globalTimer.saving && (
        <div className="overlay" onClick={() => {}}>
          <div className="overlay-form" onClick={e => e.stopPropagation()}>
            <h2 className="overlay-title">Save Session?</h2>
            <p style={{ margin: '8px 0' }}>
              {formatGlobalTime(globalTimer.seconds)} for <strong>{globalTimerProject?.name || 'Unknown'}</strong>
            </p>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={saveGlobalSession}>Save</button>
              <button className="btn btn-ghost" onClick={discardGlobalSession}>Discard</button>
            </div>
          </div>
        </div>
      )}

      {(globalTimer.running) && (
        <div className="global-timer-bar">
          <div className="global-timer-info">
            <span className="global-timer-time">{formatGlobalTime(globalTimer.seconds)}</span>
            <span className="global-timer-project">{globalTimerProject?.name || ''}</span>
          </div>
          <div className="global-timer-controls">
            {globalTimer.paused ? (
              <button className="btn btn-primary btn-sm" onClick={() => setGlobalTimer(t => ({ ...t, paused: false }))}>Resume</button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => setGlobalTimer(t => ({ ...t, paused: true }))}>Pause</button>
            )}
            <button className="btn btn-danger btn-sm" onClick={stopGlobalTimer}>Stop</button>
          </div>
        </div>
      )}

      {!globalTimer.running && !globalTimer.saving && !globalTimer.picking && (
        <button
          className="global-timer-fab"
          onClick={() => setGlobalTimer(t => ({ ...t, picking: true }))}
        >
          &#9202;
        </button>
      )}

      <nav className="tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => switchTab(t.id)}
          >
            <t.Icon className="tab-icon-svg" />
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
        <button className="tab tab-add" onClick={() => setShowNewProject(true)}>
          <span className="tab-icon">+</span>
          <span className="tab-label">New</span>
        </button>
      </nav>
    </div>
  )
}
