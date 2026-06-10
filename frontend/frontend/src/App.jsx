import { useState, useEffect } from 'react'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [authView, setAuthView] = useState('login') // 'login' or 'register'

  // Load user from localStorage on mount if token exists
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleAuthSuccess = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setAuthView('login');
  };

  return (
    <div id="center">
      <h1>To-Do App</h1>
      <p style={{ marginBottom: '20px', color: 'var(--text)' }}>
        Manage your tasks with robust, secure authentication
      </p>
      
      {currentUser ? (
        <Register 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />
      ) : authView === 'login' ? (
        <Login 
          onLoginSuccess={handleAuthSuccess} 
          onToggleView={() => setAuthView('register')} 
        />
      ) : (
        <Register 
          onRegisterSuccess={handleAuthSuccess} 
          onToggleView={() => setAuthView('login')} 
        />
      )}
      
      <div id="spacer"></div>
    </div>
  )
}

export default App
