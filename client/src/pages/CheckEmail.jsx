import { useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { resendVerificationOtp, verifyEmailOtp } from '../services/api'

function CheckEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!email || !otp) return

    setVerifying(true)
    setMessage('')

    try {
      const response = await verifyEmailOtp({ email, otp })
      if (response.data.success) {
        navigate('/email-verified', {
          state: { username: response.data?.data?.username }
        })
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    setMessage('')

    try {
      const response = await resendVerificationOtp({ email })
      if (response.data.success) {
        setMessage('Verification OTP sent!')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="check-email-page">
      <div className="container">
        <div className="card check-email-card">
          <div className="icon">📧</div>
          <h1>Verify Your Email</h1>
          <p>
            We've sent a verification OTP to
            {email && <strong> {email}</strong>}
          </p>
          <p className="secondary">
            Enter the 6-digit OTP from your email. OTP expires in 10 minutes.
          </p>

          {email && (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group" style={{ textAlign: 'left' }}>
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
              <button
                type="submit"
                disabled={verifying}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {message && (
            <div className={`alert ${message.toLowerCase().includes('sent') ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          {email && (
            <button
              onClick={handleResend}
              disabled={resending}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              {resending ? 'Sending...' : 'Resend OTP'}
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
