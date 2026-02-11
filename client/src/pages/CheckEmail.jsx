import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import api from '../services/api'

function CheckEmail() {
  const location = useLocation()
  const email = location.state?.email || ''
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setMessage('')

    try {
      const response = await api.post('/users/resend-verification', { email })
      if (response.data.success) {
        setMessage('Verification email sent!')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend email')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="check-email-page">
      <div className="container">
        <div className="card check-email-card">
          <div className="icon">📧</div>
          <h1>Check Your Email</h1>
          <p>
            We've sent a verification link to
            {email && <strong> {email}</strong>}
          </p>
          <p className="secondary">
            Click the link in the email to verify your account. The link expires in 24 hours.
          </p>

          {message && (
            <div className={`alert ${message.includes('sent') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          {email && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="btn btn-secondary"
            >
              {resending ? 'Sending...' : 'Resend Email'}
            </button>
          )}

          <div className="links">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>

      <style>{`
        .check-email-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .check-email-card {
          max-width: 450px;
          text-align: center;
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }
        .check-email-card h1 {
          font-size: 1.75rem;
          margin-bottom: 1rem;
        }
        .check-email-card p {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .check-email-card p strong {
          color: var(--text-primary);
        }
        .secondary {
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        .links {
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  )
}

export default CheckEmail
