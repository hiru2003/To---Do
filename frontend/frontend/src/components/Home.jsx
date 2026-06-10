import { useState, useEffect } from 'react';
import '../Home.css';

function Home({ currentUser, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5001/api/todos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tasks.');
      }

      setTodos(data);
    } catch (err) {
      setError(err.message || 'Error loading tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setError('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5001/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add task.');
      }

      setTodos([data, ...todos]);
      setNewTitle('');
    } catch (err) {
      setError(err.message || 'Could not add task.');
    }
  };

  const handleToggleComplete = async (todo) => {
    setError('');
    const token = localStorage.getItem('token');
    const updatedStatus = !todo.completed;

    // Optimistic UI update
    setTodos(todos.map(t => t.id === todo.id ? { ...t, completed: updatedStatus } : t));

    try {
      const response = await fetch(`http://localhost:5001/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completed: updatedStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task.');
      }
    } catch (err) {
      setError(err.message || 'Could not update task.');
      // Revert optimistic update
      setTodos(todos.map(t => t.id === todo.id ? todo : t));
    }
  };

  const handleDeleteTodo = async (todoId) => {
    setError('');
    const token = localStorage.getItem('token');
    const originalTodos = [...todos];

    // Optimistic UI update
    setTodos(todos.filter(t => t.id !== todoId));

    try {
      const response = await fetch(`http://localhost:5001/api/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task.');
      }
    } catch (err) {
      setError(err.message || 'Could not delete task.');
      // Revert optimistic update
      setTodos(originalTodos);
    }
  };

  // Calculate statistics
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="dashboard-container">
      {/* Header section */}
      <div className="dashboard-header">
        <div className="dashboard-greeting">
          <h2>Hello, {currentUser?.name || 'User'}!</h2>
          <p>Organize your day and track your progress.</p>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stats section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* Progress tracker */}
      <div className="progress-card">
        <div className="progress-header">
          <span>Task Progress</span>
          <span>{progressPercent}% Done</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Add Task input form */}
      <form className="todo-form" onSubmit={handleAddTodo}>
        <input
          type="text"
          className="todo-input"
          placeholder="Write a new task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" className="btn-add" disabled={loading}>
          Add
        </button>
      </form>

      {/* Task List container */}
      <div className="todo-list-card">
        {loading && todos.length === 0 ? (
          <div className="todo-list-empty">Loading tasks...</div>
        ) : todos.length === 0 ? (
          <div className="todo-list-empty">
            <span>📝</span>
            All caught up! Create a task to get started.
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-item-left">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={!!todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  <span className="todo-title">{todo.title}</span>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteTodo(todo.id)}
                  title="Delete task"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Home;
