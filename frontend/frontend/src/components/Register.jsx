import { useState, useEffect } from 'react';
import '../Register.css';

function Register({ onRegisterSuccess, currentUser, onLogout, onToggleView }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    let points = 0;
    if (password.length >= 6) points += 1;
    if (password.length >= 10) points += 1;
    if (/[A-Z]/.test(password)) points += 1;
    if (/[0-9]/.test(password)) points += 1;
    if (/[^A-Za-z0-9]/.test(password)) points += 1;

    if (points <= 2) {
      setPasswordStrength('weak');
    } else if (points <= 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.');
      return;
    }

    if (name.trim().length < 3) {
      setError('Name must be at least 3 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setSuccess('Registered successfully!');
      
      // Save credentials in App state and localStorage
      if (onRegisterSuccess) {
        onRegisterSuccess(data.token, data.user);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated
  if (currentUser) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="success-state">
            <div className="success-icon">✓</div>
            <div className="success-badge">Authenticated</div>
            <h2 className="register-title">Welcome, {currentUser.name}!</h2>
            <p className="register-subtitle">You are logged in and ready to manage tasks.</p>
            
            <div className="user-details-box">
              <div className="user-detail-row">
                <span className="user-detail-label">User ID:</span>
                <span>{currentUser.id}</span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Name:</span>
                <span>{currentUser.name}</span>
              </div>
              <div className="user-detail-row">
                <span className="user-detail-label">Email:</span>
                <span>{currentUser.email}</span>
              </div>
              <div className="user-detail-row" style={{ flexDirection: 'column', marginTop: '10px' }}>
                <span className="user-detail-label" style={{ marginBottom: '4px' }}>JWT Token:</span>
                <span style={{ wordBreak: 'break-all', fontSize: '11px', color: 'var(--accent)' }}>
                  {localStorage.getItem('token')}
                </span>
              </div>
            </div>

            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>
        <p className="register-subtitle">Join the modern To-Do app and organize your life.</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {password && (
              <>
                <div className="password-strength">
                  <div className={`password-strength-bar strength-${passwordStrength}`}></div>
                </div>
                <div className="password-hint">
                  Strength: {passwordStrength || 'none'} (min 6 chars)
                </div>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <p className="register-subtitle" style={{ textAlign: 'center', marginTop: '24px', marginBottom: '0' }}>
          Already have an account?{' '}
          <button 
            type="button" 
            onClick={onToggleView} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent)', 
              fontWeight: '600', 
              cursor: 'pointer',
              padding: '0 4px',
              textDecoration: 'underline'
            }}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
