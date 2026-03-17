import { useSearchParams, Link, useLocation } from 'react-router-dom'

function EmailVerified() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const username = location.state?.username || searchParams.get('username')

  return (
    <div className="verified-page">
      <div className="container">
        <div className="card verified-card">
          <div className="icon">✅</div>
          <h1>Email Verified!</h1>
          <p>
            {username ? (
              <>Welcome, <strong>@{username}</strong>!</>
            ) : (
              'Your account has been verified.'
            )}
          </p>
          <p className="secondary">You can now sign in and start playing.</p>

          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>

      <style>{`
        .verified-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .verified-card {
          max-width: 450px;
          text-align: center;
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }
        .verified-card h1 {
          font-size: 1.75rem;
          margin-bottom: 1rem;
          color: var(--success);
        }
        .verified-card p {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .verified-card p strong {
          color: var(--text-primary);
        }
        .secondary {
          margin-bottom: 1.5rem;
        }
      `}</style>
    </div>
  )
}

export default EmailVerified
