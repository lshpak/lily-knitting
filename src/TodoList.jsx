import { useState } from 'react'
import { useStorage } from './useStorage'

export default function TodoList() {
  const [todos, setTodos] = useStorage('lily-todos', [])
  const [text, setText] = useState('')

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

  const pending = todos.filter(t => !t.done)
  const completed = todos.filter(t => t.done)

  return (
    <div className="section-list">
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

      {todos.length === 0 && (
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
