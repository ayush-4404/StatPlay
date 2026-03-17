import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Leaderboard() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/users/leaderboard')
      if (response.data.success) {
        setLeaderboard(response.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="leaderboard-page">
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo">🏏 StatPlay</Link>
          <div className="nav-links">
            {user?.isAdmin && (
              <Link to="/admin" className="nav-link">⚙️ Admin</Link>
            )}
            <Link to="/quiz" className="btn btn-primary">Play Quiz</Link>
            {user && <Link to="/profile" className="btn btn-secondary">Profile</Link>}
          </div>
        </div>
      </nav>

      <main className="leaderboard-main">
        <div className="container">
          <div className="leaderboard-header">
            <h1>🏆 Leaderboard</h1>
            <p>Top players ranked by highest score</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {leaderboard.length === 0 ? (
            <div className="card empty-state">
              <p>No players yet. Be the first to play!</p>
              <Link to="/quiz" className="btn btn-primary">Start Quiz</Link>
            </div>
          ) : (
            <div className="leaderboard-table-container">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>High Score</th>
                    <th>Games Played</th>
                    <th>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player) => (
                    <tr 
                      key={player.username} 
                      className={user?.username === player.username ? 'current-user' : ''}
                    >
                      <td className="rank-cell">
                        {player.rank === 1 && <span className="medal">🥇</span>}
                        {player.rank === 2 && <span className="medal">🥈</span>}
                        {player.rank === 3 && <span className="medal">🥉</span>}
                        {player.rank > 3 && <span className="rank-number">{player.rank}</span>}
                      </td>
                      <td className="player-cell">
                        <img src={player.photo} alt={player.name} className="player-avatar" />
                        <div className="player-info">
                          <span className="player-name">{player.name}</span>
                          <span className="player-username">@{player.username}</span>
                        </div>
                      </td>
                      <td className="score-cell">{player.highestScore}</td>
                      <td className="games-cell">{player.gamesPlayed}</td>
                      <td className="avg-cell">{player.averageScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .leaderboard-page {
    min-height: 100vh;
    background: var(--bg-primary);
  }
  .navbar {
    padding: 1rem 0;
    border-bottom: 1px solid var(--border);
    background: var(--bg-secondary);
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
    text-decoration: none;
  }
  .logo:hover {
    text-decoration: none;
  }
  .nav-links {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .leaderboard-main {
    padding: 2rem 0;
  }
  .leaderboard-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .leaderboard-header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
  .leaderboard-header p {
    color: var(--text-secondary);
    font-size: 1.125rem;
  }
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
  }
  .empty-state p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
  .leaderboard-table-container {
    background: var(--bg-secondary);
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .leaderboard-table {
    width: 100%;
    border-collapse: collapse;
  }
  .leaderboard-table thead {
    background: var(--bg-input);
  }
  .leaderboard-table th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
  }
  .leaderboard-table tbody tr {
    border-top: 1px solid var(--border);
    transition: background 0.2s;
  }
  .leaderboard-table tbody tr:hover {
    background: var(--bg-input);
  }
  .leaderboard-table tbody tr.current-user {
    background: rgba(99, 102, 241, 0.1);
  }
  .leaderboard-table td {
    padding: 1rem;
  }
  .rank-cell {
    text-align: center;
    font-weight: 700;
    font-size: 1.25rem;
  }
  .medal {
    font-size: 1.5rem;
  }
  .rank-number {
    color: var(--text-secondary);
  }
  .player-cell {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .player-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--primary);
  }
  .player-info {
    display: flex;
    flex-direction: column;
  }
  .player-name {
    font-weight: 600;
    color: var(--text-primary);
  }
  .player-username {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  .score-cell {
    font-weight: 700;
    font-size: 1.25rem;
    color: var(--primary);
  }
  .games-cell {
    color: var(--text-secondary);
  }
  .avg-cell {
    color: var(--text-secondary);
    font-weight: 500;
  }
  .loading-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    .leaderboard-table {
      font-size: 0.875rem;
    }
    .leaderboard-table th,
    .leaderboard-table td {
      padding: 0.75rem 0.5rem;
    }
    .player-avatar {
      width: 36px;
      height: 36px;
    }
    .player-username {
      display: none;
    }
  }
`

export default Leaderboard
