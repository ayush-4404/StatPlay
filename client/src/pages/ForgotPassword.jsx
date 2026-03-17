import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestForgotPasswordOtp, resetPasswordWithOtp } from '../services/api'

function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await requestForgotPasswordOtp({ email })
      if (response.data.success) {
        setSuccess('OTP sent to your email')
        setStep(2)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter and one number')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await resetPasswordWithOtp({
        email,
        otp,
        newPassword
      })

      if (response.data.success) {
        navigate('/login', {
          state: { message: 'Password reset successful. Please sign in.' }
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="card auth-card">
          <div className="auth-header">
            <Link to="/login" className="back-link">← Back to Login</Link>
            <h1>Forgot Password</h1>
            <p>{step === 1 ? 'Get OTP on your email' : 'Enter OTP and set new password'}</p>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestOtp}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="otp">OTP</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => setStep(1)}
                disabled={loading}
                style={{ marginTop: '0.75rem' }}
              >
                Back to Email Step
              </button>
            </form>
          )}
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
        .form-group {
          text-align: left;
        }
      `}</style>
    </div>
  )
}

export default ForgotPassword
