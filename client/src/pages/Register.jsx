import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      setAvatar(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (formData.name.length < 3) {
      setError('Name must be at least 3 characters')
      return
    }
    if (formData.username.length < 4) {
      setError('Username must be at least 4 characters')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter and one number')
      return
    }
    if (!avatar) {
      setError('Profile picture is required')
      return
    }

    setLoading(true)

    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('username', formData.username)
      data.append('email', formData.email)
      data.append('password', formData.password)
      data.append('profilePicture', avatar)

      const result = await register(data)

      if (result.success) {
        navigate('/check-email', { state: { email: formData.email } })
      } else {
        setError(result.message || 'Registration failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
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
            <h1>Create Account</h1>
            <p>Join StatPlay and test your cricket knowledge</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group avatar-group">
              <label>Profile Picture *</label>
              <div className="avatar-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  id="avatar-input"
                />
                <label htmlFor="avatar-input" className="avatar-label">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="avatar-preview" />
                  ) : (
                    <span className="avatar-placeholder">📷 Upload Photo</span>
                  )}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
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
        .avatar-group {
          text-align: center;
        }
        .avatar-upload {
          margin-top: 0.5rem;
        }
        .avatar-upload input {
          display: none;
        }
        .avatar-label {
          display: inline-block;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .avatar-label:hover {
          opacity: 0.8;
        }
        .avatar-preview {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--primary);
        }
        .avatar-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--bg-input);
          border: 2px dashed var(--border);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}

export default Register
