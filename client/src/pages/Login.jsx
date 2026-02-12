import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Show message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message)
    }
  }, [location.state])

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile', { replace: true })
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await login(identifier, password)
      // Navigation handled by useEffect when user state updates
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-header">
            <Link to="/" className="back-link">← Back</Link>
            <h1>Welcome Back</h1>
            <p>Sign in to continue playing</p>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="identifier">Email or Username</label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or username"
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .auth-container {
          width: 100%;
          max-width: 420px;
        }
        .auth-card {
          text-align: center;
        }
        .auth-header {
          margin-bottom: 2rem;
        }
        .back-link {
          display: inline-block;
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        .auth-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }
        .auth-header p {
          color: var(--text-secondary);
        }
        .auth-footer {
          margin-top: 1.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .form-group {
          text-align: left;
        }
      `}</style>
    </div>
  )
}

export default Login
