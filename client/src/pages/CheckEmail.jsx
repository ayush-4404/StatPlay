import { Link, useLocation } from 'react-router-dom'
import './Auth.css'

function CheckEmail() {
  const location = useLocation()
  const email = location.state?.email || 'your email'

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>📧</div>
        <h1 style={{ color: '#333', marginBottom: '15px' }}>Check Your Email</h1>
        <p style={{ color: '#666', marginBottom: '25px', lineHeight: 1.6 }}>
          We've sent a verification link to <strong>{email}</strong>. 
          Please click the link in the email to verify your account.
        </p>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '25px'
        }}>
          <p style={{ color: '#666', fontSize: '14px' }}>
            <strong>Didn't receive the email?</strong><br />
            Check your spam folder or wait a few minutes and try again.
          </p>
        </div>

        <Link to="/login" className="btn btn-primary">
          Go to Login
        </Link>
      </div>
    </div>
  )
}

export default CheckEmail
