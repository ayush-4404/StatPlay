import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Quiz() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  // Quiz state
  const [quizState, setQuizState] = useState('idle') // idle, loading, playing, result, gameover
  const [quizSessionId, setQuizSessionId] = useState(null)
  const [roundNumber, setRoundNumber] = useState(1)
  const [visibleStats, setVisibleStats] = useState({})
  const [imageHidden, setImageHidden] = useState(null)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [totalScore, setTotalScore] = useState(0)
  const [guess, setGuess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [revealedData, setRevealedData] = useState(null)
  const [hasActiveQuiz, setHasActiveQuiz] = useState(false)

  // Check for active quiz on mount and refresh user for coin balance
  useEffect(() => {
    refreshUser()
    checkActiveQuiz()
  }, [])

  const checkActiveQuiz = async () => {
    try {
      const response = await api.get('/quiz/status')
      if (response.data.success && response.data.data.hasActiveQuiz) {
        setHasActiveQuiz(true)
        const data = response.data.data
        setQuizSessionId(data.quizSessionId)
        setRoundNumber(data.roundNumber)
        setVisibleStats(data.visibleStats || {})
        setImageHidden(data.imageHidden || null)
        setAttemptsLeft(data.attemptsLeft)
        setTotalScore(data.totalScore)
        setQuizState('playing')
      }
    } catch (err) {
      console.error('Error checking quiz status:', err)
    }
  }

  const startNewQuiz = async (forceNew = false) => {
    setQuizState('loading')
    setError('')
    setFeedback(null)
    setRevealedData(null)

    try {
      const response = await api.post('/quiz/start', { forceNew })
      if (response.data.success) {
        const data = response.data.data
        setQuizSessionId(data.quizSessionId)
        setRoundNumber(data.roundNumber)
        setVisibleStats(data.visibleStats || {})
        setImageHidden(data.imageHidden || null)
        setAttemptsLeft(data.attemptsLeft)
        setTotalScore(data.totalScore)
        setQuizState('playing')
        setHasActiveQuiz(false)
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start quiz'
      if (msg.includes('active quiz')) {
        setHasActiveQuiz(true)
        setQuizState('idle')
      } else {
        setError(msg)
        setQuizState('idle')
      }
    }
  }

  const submitGuess = async (e) => {
    e.preventDefault()
    if (!guess.trim() || submitting) return

    setSubmitting(true)
    setFeedback(null)
    setError('')

    try {
      const response = await api.post('/quiz/guess', {
        quizSessionId,
        guessedPlayerName: guess.trim()
      })

      if (response.data.success) {
        const data = response.data.data
        setTotalScore(data.totalScore)

        if (data.correct) {
          // Correct guess
          setFeedback({
            type: 'correct',
            message: `Correct! +${data.scoreAwarded} points`,
            scoreAwarded: data.scoreAwarded
          })
          setRevealedData(data.revealedData)
          setQuizState('result')

          // Load next round data
          if (data.nextRound) {
            setTimeout(() => {
              setRoundNumber(data.nextRound.roundNumber)
              setVisibleStats(data.nextRound.visibleStats || {})
              setImageHidden(data.nextRound.imageHidden || null)
              setAttemptsLeft(data.nextRound.attemptsLeft)
              setGuess('')
              setFeedback(null)
              setRevealedData(null)
              setQuizState('playing')
            }, 3000)
          }
        } else if (data.gameOver) {
          // Game over
          setFeedback({
            type: 'gameover',
            message: 'Game Over!'
          })
          setRevealedData(data.revealedData)
          setQuizState('gameover')
          refreshUser()
        } else {
          // Wrong guess, attempts remaining
          setAttemptsLeft(data.attemptsLeft)
          setFeedback({
            type: 'wrong',
            message: `Wrong! ${data.attemptsLeft} attempts left`
          })
          setGuess('')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit guess')
    } finally {
      setSubmitting(false)
    }
  }

  const exitQuiz = async () => {
    try {
      await api.post('/quiz/exit', { quizSessionId })
      refreshUser()
      navigate('/profile')
    } catch (err) {
      console.error('Error exiting quiz:', err)
      navigate('/profile')
    }
  }

  const renderStats = () => {
    if (!visibleStats || Object.keys(visibleStats).length === 0) {
      return <p className="no-stats">No stats available</p>
    }

    return (
      <div className="stats-grid">
        {Object.entries(visibleStats).map(([key, value]) => (
          <div key={key} className="stat-item">
            <span className="stat-label">{formatStatLabel(key)}</span>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>
    )
  }

  const formatStatLabel = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  // Idle state - show start/resume options
  if (quizState === 'idle') {
    const canAffordQuiz = (user?.coins || 0) >= 1

    return (
      <div className="quiz-page">
        <nav className="navbar">
          <div className="container navbar-content">
            <Link to="/" className="logo">🏏 StatPlay</Link>
            <div className="nav-right">
              <Link to="/leaderboard" className="nav-link">🏆 Leaderboard</Link>
              {user?.isAdmin && (
                <Link to="/admin" className="nav-link">⚙️ Admin</Link>
              )}
              <span className="coin-badge">🪙 {user?.coins || 0} coins</span>
              <Link to="/profile" className="btn btn-secondary">Profile</Link>
            </div>
          </div>
        </nav>

        <main className="quiz-main">
          <div className="container">
            <div className="card quiz-start-card">
              <h1>Cricket Quiz</h1>
              <p>Guess the cricketer from their stats!</p>

              <div className="rules">
                <h3>How to Play</h3>
                <ul>
                  <li>🎯 You get 3 attempts per cricketer</li>
                  <li>📊 Stats are revealed to help you guess</li>
                  <li>⭐ Score: 10 pts (1st try), 7 pts (2nd), 5 pts (3rd)</li>
                  <li>💀 Game ends when you fail to guess correctly</li>
                  <li>🪙 Cost: 1 coin per game</li>
                </ul>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              {!canAffordQuiz && (
                <div className="alert alert-warning">
                  You need at least 1 coin to play. Come back later!
                </div>
              )}

              {hasActiveQuiz ? (
                <div className="active-quiz-options">
                  <p className="alert alert-warning">You have an active quiz!</p>
                  <button onClick={() => startNewQuiz(false)} className="btn btn-primary btn-block">
                    Resume Quiz
                  </button>
                  <button onClick={() => startNewQuiz(true)} className="btn btn-secondary btn-block" disabled={!canAffordQuiz}>
                    Start New Quiz (1 🪙)
                  </button>
                </div>
              ) : (
                <button onClick={() => startNewQuiz()} className="btn btn-primary btn-block btn-large" disabled={!canAffordQuiz}>
                  Start Quiz (1 🪙)
                </button>
              )}
            </div>
          </div>
        </main>

        <style>{styles}</style>
      </div>
    )
  }

  // Loading state
  if (quizState === 'loading') {
    return (
      <div className="quiz-page">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading quiz...</p>
        </div>
        <style>{styles}</style>
      </div>
    )
  }

  // Game over state
  if (quizState === 'gameover') {
    return (
      <div className="quiz-page">
        <nav className="navbar">
          <div className="container navbar-content">
            <Link to="/" className="logo">🏏 StatPlay</Link>
            <div className="nav-right">
              <Link to="/leaderboard" className="nav-link">🏆 Leaderboard</Link>
              {user?.isAdmin && (
                <Link to="/admin" className="nav-link">⚙️ Admin</Link>
              )}
              <Link to="/profile" className="btn btn-secondary">Profile</Link>
            </div>
          </div>
        </nav>

        <main className="quiz-main">
          <div className="container">
            <div className="card gameover-card">
              <div className="gameover-icon">💀</div>
              <h1>Game Over!</h1>
              
              {revealedData && (
                <div className="revealed-section">
                  <p className="correct-answer">The answer was: <strong>{revealedData.correctName}</strong></p>
                  {revealedData.imageRevealed && (
                    <img src={revealedData.imageRevealed} alt={revealedData.correctName} className="player-image" />
                  )}
                </div>
              )}

              <div className="final-score">
                <span className="score-label">This Game Score</span>
                <span className="score-value">{totalScore}</span>
              </div>

              <div className="final-score">
                <span className="score-label">Average Score per Game</span>
                <span className="score-value">
                  {user?.gamesPlayed > 0 ? (user.totalScore / user.gamesPlayed).toFixed(1) : '0'}
                </span>
              </div>

              <div className="gameover-actions">
                <button onClick={() => startNewQuiz()} className="btn btn-primary">
                  Play Again
                </button>
                <Link to="/profile" className="btn btn-secondary">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </main>

        <style>{styles}</style>
      </div>
    )
  }

  // Playing state (includes result showing)
  return (
    <div className="quiz-page">
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo">🏏 StatPlay</Link>
          <div className="quiz-info">
            <span className="round-badge">Round {roundNumber}</span>
            <span className="score-badge">Score: {totalScore}</span>
          </div>
        </div>
      </nav>

      <main className="quiz-main">
        <div className="container">
          <div className="card quiz-card">
            {quizState === 'result' ? (
              // Show result before next round
              <div className="result-section">
                <div className="result-icon">🎉</div>
                <h2>{feedback?.message}</h2>
                {revealedData && (
                  <>
                    <p className="correct-answer">It was <strong>{revealedData.correctName}</strong></p>
                    {revealedData.imageRevealed && (
                      <img src={revealedData.imageRevealed} alt={revealedData.correctName} className="player-image" />
                    )}
                  </>
                )}
                <p className="loading-next">Loading next round...</p>
              </div>
            ) : (
              // Playing - show stats and guess form
              <>
                <div className="quiz-header">
                  <h2>Who is this cricketer?</h2>
                  <div className="attempts-display">
                    {[...Array(3)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`attempt-dot ${i < attemptsLeft ? 'active' : 'used'}`}
                      >
                        {i < attemptsLeft ? '❤️' : '🖤'}
                      </span>
                    ))}
                  </div>
                </div>

                {imageHidden && (
                  <div className="image-section">
                    <img 
                      src={imageHidden} 
                      alt="Hidden cricketer" 
                      className="cricketer-image"
                    />
                  </div>
                )}

                <div className="stats-section">
                  <h3>Player Stats</h3>
                  {renderStats()}
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                
                {feedback && feedback.type === 'wrong' && (
                  <div className="alert alert-warning">{feedback.message}</div>
                )}

                <form onSubmit={submitGuess} className="guess-form">
                  <div className="form-group">
                    <input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Enter player name..."
                      disabled={submitting}
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !guess.trim()}>
                    {submitting ? 'Checking...' : 'Submit Guess'}
                  </button>
                </form>

                <button onClick={exitQuiz} className="btn btn-danger exit-btn">
                  Exit Quiz
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .quiz-page {
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
  .quiz-info {
    display: flex;
    gap: 1rem;
  }
  .round-badge, .score-badge {
    background: var(--bg-input);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
  }
  .score-badge {
    color: var(--primary);
  }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .nav-link {
    color: var(--text-secondary);
    font-weight: 500;
    text-decoration: none;
  }
  .nav-link:hover {
    color: var(--text-primary);
  }
  .coin-badge {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: white;
  }
  .quiz-main {
    padding: 2rem 0;
  }
  .quiz-start-card, .quiz-card, .gameover-card {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }
  .quiz-start-card h1, .gameover-card h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  .quiz-start-card > p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
  }
  .rules {
    background: var(--bg-input);
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
    text-align: left;
  }
  .rules h3 {
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  .rules ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .rules li {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
  .btn-large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
  .active-quiz-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .quiz-header {
    margin-bottom: 1.5rem;
  }
  .quiz-header h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  .attempts-display {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.5rem;
  }
  .image-section {
    margin: 2rem 0;
    display: flex;
    justify-content: center;
  }
  .cricketer-image {
    max-width: 100%;
    width: 300px;
    height: 300px;
    object-fit: cover;
    border-radius: 1rem;
    border: 3px solid var(--primary);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  .stats-section {
    margin-bottom: 2rem;
  }
  .stats-section h3 {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  .stat-item {
    background: var(--bg-input);
    padding: 1rem;
    border-radius: 0.5rem;
  }
  .stat-label {
    display: block;
    font-size: 0.75rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: 0.25rem;
  }
  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
  }
  .no-stats {
    color: var(--text-muted);
  }
  .guess-form {
    margin-bottom: 1rem;
  }
  .guess-form input {
    text-align: center;
    font-size: 1.125rem;
  }
  .exit-btn {
    width: 100%;
    margin-top: 0.5rem;
  }
  .result-section, .gameover-card {
    padding: 2rem 0;
  }
  .result-icon, .gameover-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  .correct-answer {
    font-size: 1.125rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  .correct-answer strong {
    color: var(--text-primary);
  }
  .player-image {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    object-fit: cover;
    margin: 1rem 0;
    border: 3px solid var(--primary);
  }
  .loading-next {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-top: 1rem;
  }
  .final-score {
    background: var(--bg-input);
    padding: 1.5rem;
    border-radius: 1rem;
    margin: 2rem 0;
  }
  .score-label {
    display: block;
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .final-score .score-value {
    font-size: 3rem;
    font-weight: 700;
    color: var(--primary);
  }
  .gameover-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .revealed-section {
    margin: 1.5rem 0;
  }
`

export default Quiz
