import { Link, useSearchParams } from 'react-router-dom'
import './Auth.css'

function EmailVerified() {
  const [searchParams] = useSearchParams()
  const username = searchParams.get('username')

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ color: '#155724', marginBottom: '15px' }}>Email Verified!</h1>
        <p style={{ color: '#666', marginBottom: '25px', lineHeight: 1.6 }}>
          {username && `Welcome ${username}! `}
          Your email has been successfully verified. 
          You can now login to your account and start playing!
        </p>

        <Link to="/login" className="btn btn-primary">
          Login Now
        </Link>
      </div>
    </div>
  )
}

export default EmailVerified
