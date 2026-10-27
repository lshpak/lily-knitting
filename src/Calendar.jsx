import { useState } from 'react'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatTime(sec) {
  if (!sec) return '0m'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  if (m > 0) return `${m}m`
  return '<1m'
}

function pad(n) {
  return n.toString().padStart(2, '0')
}

export default function Calendar({ sessions = [], projects = [], finished = [] }) {
  const allProjects = [...projects, ...finished]
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(null)

  const sessionsByDate = {}
  for (const s of sessions) {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = []
    sessionsByDate[s.date].push(s)
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const cells = []
  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }

  function dateStr(day) {
    return `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`
  }

  function getDaySeconds(day) {
    const key = dateStr(day)
    const daySessions = sessionsByDate[key]
    if (!daySessions) return 0
    return daySessions.reduce((sum, s) => sum + s.seconds, 0)
  }

  function getIntensity(seconds) {
    if (!seconds) return 0
    if (seconds < 3600) return 1
    if (seconds < 7200) return 2
    if (seconds < 10800) return 3
    return 4
  }

  function goBack() {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1)
      setViewMonth(11)
    } else {
      setViewMonth(viewMonth - 1)
    }
    setSelectedDate(null)
  }

  function goForward() {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1)
      setViewMonth(0)
    } else {
      setViewMonth(viewMonth + 1)
    }
    setSelectedDate(null)
  }

  function goToday() {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelectedDate(null)
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  const selectedSessions = selectedDate ? (sessionsByDate[selectedDate] || []) : []
  const selectedTotal = selectedSessions.reduce((sum, s) => sum + s.seconds, 0)

  const projectsForDay = {}
  for (const s of selectedSessions) {
    if (!projectsForDay[s.projectId]) {
      projectsForDay[s.projectId] = { seconds: 0, count: 0 }
    }
    projectsForDay[s.projectId].seconds += s.seconds
    projectsForDay[s.projectId].count += 1
  }

  const monthTotalSeconds = Object.keys(sessionsByDate).reduce((sum, date) => {
    if (date.startsWith(`${viewYear}-${pad(viewMonth + 1)}`)) {
      return sum + sessionsByDate[date].reduce((s, sess) => s + sess.seconds, 0)
    }
    return sum
  }, 0)

  const monthActiveDays = Object.keys(sessionsByDate).filter(date =>
    date.startsWith(`${viewYear}-${pad(viewMonth + 1)}`)
  ).length

  return (
    <div className="calendar-page">
      <div className="calendar-nav">
        <button className="btn btn-ghost btn-sm" onClick={goBack}>&larr;</button>
        <button className="calendar-month-label" onClick={goToday}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={goForward}>&rarr;</button>
      </div>

      {(monthTotalSeconds > 0 || monthActiveDays > 0) && (
        <div className="calendar-month-stats">
          <span>{formatTime(monthTotalSeconds)}</span>
          <span className="calendar-month-stats-sep">&middot;</span>
          <span>{monthActiveDays} day{monthActiveDays === 1 ? '' : 's'}</span>
        </div>
      )}

      <div className="calendar-grid">
        {DAY_LABELS.map(d => (
          <div key={d} className="calendar-day-label">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} className="calendar-cell calendar-cell-empty" />
          const ds = dateStr(day)
          const seconds = getDaySeconds(day)
          const intensity = getIntensity(seconds)
          const isToday = ds === todayStr
          const isSelected = ds === selectedDate
          return (
            <button
              key={ds}
              className={
                'calendar-cell' +
                (intensity > 0 ? ` calendar-intensity-${intensity}` : '') +
                (isToday ? ' calendar-today' : '') +
                (isSelected ? ' calendar-selected' : '')
              }
              onClick={() => setSelectedDate(isSelected ? null : ds)}
            >
              <span className="calendar-day-num">{day}</span>
              {seconds > 0 && <span className="calendar-day-time">{formatTime(seconds)}</span>}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <div className="calendar-detail">
          <h3 className="calendar-detail-date">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          {selectedSessions.length === 0 ? (
            <p className="calendar-detail-empty">No knitting this day</p>
          ) : (
            <>
              <p className="calendar-detail-total">{formatTime(selectedTotal)} total</p>
              <div className="calendar-detail-projects">
                {Object.entries(projectsForDay).map(([pid, info]) => {
                  const proj = allProjects.find(p => p.id === pid)
                  return (
                    <div key={pid} className="calendar-project-row">
                      <div className="calendar-project-info">
                        {proj?.type && <span className="project-tag">{proj.type}</span>}
                        <span className="calendar-project-name">{proj?.name || 'Deleted project'}</span>
                      </div>
                      <span className="calendar-project-time">{formatTime(info.seconds)}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {sessions.length === 0 && !isCurrentMonth && (
        <div className="empty-state">
          <div className="empty-icon-text">&mdash;</div>
          <p>No sessions recorded yet</p>
          <p className="subtle">Use the timer or add time manually to track your knitting</p>
        </div>
      )}

      {sessions.length === 0 && isCurrentMonth && (
        <div className="empty-state">
          <div className="empty-icon-text">&mdash;</div>
          <p>No sessions recorded yet</p>
          <p className="subtle">Use the timer or add time manually to see your activity here</p>
        </div>
      )}
    </div>
  )
}
