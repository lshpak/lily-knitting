import { useState } from 'react'
import { useStorage } from './useStorage'

export default function TodoList({ unstartedProjects = [], onStartProject, onDeleteProject }) {
  const [todos, setTodos] = useStorage('lily-todos', [])
  const [text, setText] = useState('')
  const [startingId, setStartingId] = useState(null)
  const [startDate, setStartDate] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setTodos([...todos, {
      id: Date.now().toString(),
      text: text.trim(),
      done: false,
    }])
    setText('')
  }

  function toggle(id) {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTodo(id) {
    setTodos(todos.filter(t => t.id !== id))
  }

  function todayStr() {
    return new Date().toISOString().split('T')[0]
  }

  function handleStartClick(id) {
    setStartDate(todayStr())
    setStartingId(id)
  }

  function confirmStart(id) {
    if (startDate) {
      onStartProject(id, startDate)
    }
    setStartingId(null)
    setStartDate('')
  }

  const pending = todos.filter(t => !t.done)
  const completed = todos.filter(t => t.done)

  return (
    <div className="section-list">
      {unstartedProjects.length > 0 && (
        <>
          <p className="completed-label">Upcoming Projects ({unstartedProjects.length})</p>
          <div className="items">
            {unstartedProjects.map(p => (
              <div key={p.id} className="project-card">
                <div className="project-card-info">
                  {p.type && <span className="project-tag">{p.type}</span>}
                  <h3>{p.name}</h3>
                  {(p.designer || p.size) && (
                    <span className="project-card-meta">
                      {[p.designer ? `by ${p.designer}` : '', p.size ? `Size ${p.size}` : ''].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </div>
                <div className="project-card-actions">
                  {startingId === p.id ? (
                    <div className="start-date-picker">
                      <input
                        type="date"
                        className="input input-sm"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                      />
                      <button className="btn btn-primary btn-sm" onClick={() => confirmStart(p.id)}>
                        Go
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setStartingId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => handleStartClick(p.id)}>
                      Start
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete "${p.name}"?`)) onDeleteProject(p.id)
                    }}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="completed-label">To-Do</p>
      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          placeholder="Add a to-do..."
          value={text}
          onChange={e => setText(e.target.value)}
          className="input"
        />
        <button type="submit" className="btn btn-primary" disabled={!text.trim()}>Add</button>
      </form>

      {todos.length === 0 && unstartedProjects.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>Nothing to do</p>
          <p className="subtle">Add tasks like "buy circular needles" or "swatch gauge"</p>
        </div>
      )}

      <div className="items">
        {pending.map(todo => (
          <div key={todo.id} className="todo-item">
            <button className="todo-check" onClick={() => toggle(todo.id)} />
            <span className="todo-text">{todo.text}</span>
            <button className="btn btn-ghost btn-sm delete-btn" onClick={() => deleteTodo(todo.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>

      {completed.length > 0 && (
        <>
          <p className="completed-label">Completed ({completed.length})</p>
          <div className="items">
            {completed.map(todo => (
              <div key={todo.id} className="todo-item todo-done">
                <button className="todo-check checked" onClick={() => toggle(todo.id)} />
                <span className="todo-text">{todo.text}</span>
                <button className="btn btn-ghost btn-sm delete-btn" onClick={() => deleteTodo(todo.id)}>
                  &times;
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
