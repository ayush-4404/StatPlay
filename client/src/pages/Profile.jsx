import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo">🏏 StatPlay</Link>
          <div className="nav-links">
            <Link to="/quiz" className="btn btn-primary">Play Quiz</Link>
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </nav>

      <main className="profile-main">
        <div className="container">
          <div className="profile-grid">
            <div className="card profile-card">
              <div className="profile-header">
                <img src={user.photo} alt={user.name} className="profile-avatar" />
                <div className="profile-info">
                  <h1>{user.name}</h1>
                  <p className="username">@{user.username}</p>
                  <p className="email">{user.email}</p>
                </div>
              </div>
              
              <div className="verification-badge">
                {user.isEmailVerified ? (
                  <span className="verified">✓ Email Verified</span>
                ) : (
                  <span className="unverified">⚠ Email Not Verified</span>
                )}
              </div>
            </div>

            <div className="card stats-card">
              <h2>Your Stats</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{user.gamesPlayed || 0}</span>
                  <span className="stat-label">Games Played</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.highestScore || 0}</span>
                  <span className="stat-label">High Score</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.totalScore || 0}</span>
                  <span className="stat-label">Total Score</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.coins || 0}</span>
                  <span className="stat-label">Coins</span>
                </div>
              </div>
            </div>

            <div className="card action-card">
              <h2>Ready to Play?</h2>
              <p>Test your cricket knowledge and beat your high score!</p>
              <Link to="/quiz" className="btn btn-primary btn-block">Start Quiz</Link>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .profile-page {
          min-height: 100vh;
        }
        .navbar {
          padding: 1rem 0;
          border-bottom: 1px solid var(--border);
        }
        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .logo:hover {
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .profile-main {
          padding: 2rem 0;
        }
        .profile-grid {
          display: grid;
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .profile-card .profile-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--primary);
        }
        .profile-info h1 {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .username {
          color: var(--primary);
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        .email {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .verification-badge {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .verified {
          color: var(--success);
          font-size: 0.875rem;
        }
        .unverified {
          color: var(--warning);
          font-size: 0.875rem;
        }
        .stats-card h2, .action-card h2 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .stat-item {
          background: var(--bg-input);
          padding: 1rem;
          border-radius: 0.5rem;
          text-align: center;
        }
        .stat-value {
          display: block;
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--primary);
        }
        .stat-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .action-card p {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        @media (max-width: 640px) {
          .profile-card .profile-header {
            flex-direction: column;
            text-align: center;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}

export default Profile
