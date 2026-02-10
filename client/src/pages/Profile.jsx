import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  // Refresh user data when profile loads
  useEffect(() => {
    refreshUser()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handlePlayQuiz = () => {
    navigate('/quiz')
  }

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
        <div className="spinner"></div>
        <p style={{ color: 'white', marginTop: '20px' }}>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <img 
            src={user.photo || user.avatar || 'https://via.placeholder.com/120'} 
            alt={user.name || user.fullName}
            className="profile-avatar"
          />
          <h1>{user.name || user.fullName}</h1>
          <p className="username">@{user.username}</p>
          <p className="email">{user.email}</p>
        </div>

        <div className="stats-section">
          <h2>📊 Your Stats</h2>
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-number">{user.gamesPlayed || 0}</span>
              <span className="stat-title">Games Played</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{user.totalScore || 0}</span>
              <span className="stat-title">Total Score</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{user.highestScore || 0}</span>
              <span className="stat-title">Highest Score</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handlePlayQuiz} className="btn btn-primary btn-large">
            🏏 Play Quiz
          </button>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            Home
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
