import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Quiz.css'

// Create a separate axios instance for quiz endpoints
const quizApi = axios.create({
  baseURL: '/quiz',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
quizApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const GAME_STATE = {
  START: 'start',
  PLAYING: 'playing',
  REVEALED: 'revealed',
  RESULTS: 'results'
}

function Quiz() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState(GAME_STATE.START)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // Quiz data
  const [quizSessionId, setQuizSessionId] = useState(null)
  const [roundNumber, setRoundNumber] = useState(1)
  const [totalScore, setTotalScore] = useState(0)
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [visibleStats, setVisibleStats] = useState({})
  const [imageHidden, setImageHidden] = useState('')
  const [guess, setGuess] = useState('')
  const [guesses, setGuesses] = useState([])
  
  // Revealed data
  const [revealedData, setRevealedData] = useState(null)
  const [scoreAwarded, setScoreAwarded] = useState(0)
  const [wasCorrect, setWasCorrect] = useState(false)
  const [hasNextRound, setHasNextRound] = useState(false)
  const [nextRoundData, setNextRoundData] = useState(null)
  
  // Results
  const [results, setResults] = useState(null)

  const showMessage = useCallback((text, type = 'info') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }, [])

  // Check for active quiz on mount
  useEffect(() => {
    checkActiveQuiz()
  }, [])

  const checkActiveQuiz = async () => {
    try {
      const response = await quizApi.get('/status')
      const data = response.data
      
      if (data.success && data.data.hasActiveQuiz) {
        if (window.confirm('You have an active quiz. Do you want to resume it?')) {
          loadQuizData(data.data)
        }
      }
    } catch (err) {
      console.error('Error checking active quiz:', err)
    }
  }

  const loadQuizData = (data) => {
    setQuizSessionId(data.quizSessionId)
    setRoundNumber(data.roundNumber)
    setTotalScore(data.totalScore)
    setAttemptsLeft(data.attemptsLeft)
    setVisibleStats(data.visibleStats || {})
    setImageHidden(data.imageHidden)
    setGuesses([])
    setGuess('')
    setGameState(GAME_STATE.PLAYING)
  }

  const startQuiz = async (forceNew = false) => {
    setLoading(true)
    setError('')

    try {
      const response = await quizApi.post('/start', { 
        numberOfPlayers: 5, 
        forceNew 
      })
      
      const result = response.data
      console.log('Start quiz response:', result)

      if (!result.success) {
        if (result.message?.includes('already have an active quiz')) {
          const resume = window.confirm(
            'You have an unfinished quiz.\n\nOK = Resume old quiz\nCancel = Start fresh'
          )
          if (resume) {
            await checkActiveQuiz()
          } else {
            await startQuiz(true)
          }
          return
        }
        setError(result.message)
        return
      }

      loadQuizData(result.data)
    } catch (err) {
      console.error('Error starting quiz:', err)
      setError(err.response?.data?.message || 'Failed to start quiz')
    } finally {
      setLoading(false)
    }
  }

  const submitGuess = async () => {
    if (!guess.trim()) {
      showMessage('Please enter a guess', 'error')
      return
    }

    setLoading(true)

    try {
      const response = await quizApi.post('/guess', {
        quizSessionId,
        guessedPlayerName: guess.trim()
      })

      const result = response.data
      console.log('Guess response:', result)

      if (!result.success) {
        showMessage(result.message, 'error')
        setLoading(false)
        return
      }

      const data = result.data
      setTotalScore(data.totalScore)

      if (data.correct || data.attemptsExhausted) {
        // Round completed - show revealed data
        setRevealedData(data.revealedData)
        setScoreAwarded(data.scoreAwarded)
        setWasCorrect(data.correct)
        setGameState(GAME_STATE.REVEALED)

        if (data.quizCompleted || data.gameOver) {
          // Quiz ended
          setResults({
            totalScore: data.totalScore,
            roundsCompleted: roundNumber,
            message: data.message,
            gameOver: data.gameOver
          })
          setHasNextRound(false)
        } else if (data.nextRound) {
          setHasNextRound(true)
          setNextRoundData(data.nextRound)
        }
      } else {
        // Wrong guess but attempts left
        setGuesses([...guesses, guess])
        setAttemptsLeft(data.attemptsLeft)
        showMessage(result.message, 'error')
        setGuess('')
      }
    } catch (err) {
      console.error('Error submitting guess:', err)
      showMessage(err.response?.data?.message || 'Failed to submit guess', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadNextRound = () => {
    if (!nextRoundData) return

    setRoundNumber(nextRoundData.roundNumber)
    setVisibleStats(nextRoundData.visibleStats || {})
    setImageHidden(nextRoundData.imageHidden)
    setAttemptsLeft(nextRoundData.attemptsLeft || 3)
    setGuesses([])
    setGuess('')
    setRevealedData(null)
    setHasNextRound(false)
    setNextRoundData(null)
    setGameState(GAME_STATE.PLAYING)
    showMessage('Next cricketer loaded!', 'success')
  }

  const showResultsScreen = () => {
    setGameState(GAME_STATE.RESULTS)
  }

  const exitQuiz = async () => {
    if (!window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      return
    }

    setLoading(true)

    try {
      const response = await quizApi.post('/exit', { quizSessionId })
      const result = response.data
      
      if (result.success) {
        setResults({
          totalScore: result.data.totalScore,
          roundsCompleted: result.data.roundsCompleted,
          roundsWon: result.data.roundsWon,
          message: result.data.message
        })
        setGameState(GAME_STATE.RESULTS)
      }
    } catch (err) {
      console.error('Error exiting quiz:', err)
      showMessage('Failed to exit quiz', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameState === GAME_STATE.PLAYING) {
      submitGuess()
    }
  }

  // Render start screen
  if (gameState === GAME_STATE.START) {
    return (
      <div className="quiz-container">
        <div className="quiz-card start-screen">
          <h1>🏏 Cricket Quiz</h1>
          <p>Test your knowledge of cricket legends!</p>
          
          <div className="rules-box">
            <h3>📋 How to Play</h3>
            <ul>
              <li>You'll be shown stats of a mystery cricketer</li>
              <li>You have 3 attempts to guess who it is</li>
              <li>Score: 10 points (1st try), 7 points (2nd), 5 points (3rd)</li>
              <li>Game ends when you fail to guess a cricketer</li>
              <li>Try to get the highest score possible!</li>
            </ul>
          </div>

          {error && <div className="message error">{error}</div>}

          <button 
            onClick={() => startQuiz()} 
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Starting...' : '🎮 Start Quiz'}
          </button>

          <button 
            onClick={() => navigate('/profile')} 
            className="btn btn-secondary"
            style={{ marginTop: '15px' }}
          >
            Back to Profile
          </button>
        </div>
      </div>
    )
  }

  // Render playing screen
  if (gameState === GAME_STATE.PLAYING) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>🏏 Cricket Quiz</h2>
          <div className="score-board">
            <span className="score-item">Round: <strong>{roundNumber}</strong></span>
            <span className="score-item">Score: <strong>{totalScore}</strong></span>
            <span className="score-item">Attempts: <strong>{attemptsLeft}</strong></span>
          </div>
        </div>

        <div className="quiz-card">
          {message.text && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          <img 
            src={imageHidden} 
            alt="Mystery Cricketer" 
            className="cricketer-image"
          />

          <div className="stats-grid">
            {Object.entries(visibleStats).map(([key, value]) => (
              <div key={key} className="stat-item">
                <div className="stat-label">{key}</div>
                <div className="stat-value">{value}</div>
              </div>
            ))}
          </div>

          <div className="attempts-display">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`attempt-dot ${i > attemptsLeft ? 'used' : ''}`}
              />
            ))}
          </div>

          {guesses.length > 0 && (
            <div className="guesses-list">
              <h4>Your guesses:</h4>
              {guesses.map((g, i) => (
                <div key={i} className="guess-item">❌ {g}</div>
              ))}
            </div>
          )}

          <div className="guess-section">
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter cricketer's name..."
              className="guess-input"
              disabled={loading}
              autoFocus
            />
            <button 
              onClick={submitGuess} 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Submit Guess'}
            </button>
          </div>

          <button onClick={exitQuiz} className="btn btn-secondary exit-btn">
            Exit Quiz
          </button>
        </div>
      </div>
    )
  }

  // Render revealed screen
  if (gameState === GAME_STATE.REVEALED) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>🏏 Cricket Quiz</h2>
          <div className="score-board">
            <span className="score-item">Round: <strong>{roundNumber}</strong></span>
            <span className="score-item">Score: <strong>{totalScore}</strong></span>
          </div>
        </div>

        <div className="quiz-card revealed-card">
          <h2 className={wasCorrect ? 'correct' : 'wrong'}>
            {wasCorrect ? '✅ Correct!' : '❌ Wrong!'}
          </h2>
          <h1>{revealedData?.correctName}</h1>
          
          <img 
            src={revealedData?.imageRevealed} 
            alt={revealedData?.correctName}
            className="cricketer-image revealed"
          />

          <p className="score-awarded">
            {wasCorrect ? `+${scoreAwarded} points!` : 'No points this round'}
          </p>

          <h3>📊 Complete Stats</h3>
          <div className="stats-grid">
            {revealedData?.allStats && Object.entries(revealedData.allStats).map(([key, value]) => (
              <div key={key} className="stat-item">
                <div className="stat-label">{key}</div>
                <div className="stat-value">{value}</div>
              </div>
            ))}
          </div>

          <div className="action-buttons">
            {hasNextRound ? (
              <button onClick={loadNextRound} className="btn btn-primary btn-large">
                Next Cricketer →
              </button>
            ) : (
              <button onClick={showResultsScreen} className="btn btn-primary btn-large">
                View Results
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render results screen
  if (gameState === GAME_STATE.RESULTS) {
    return (
      <div className="quiz-container">
        <div className="quiz-card results-card">
          <h1>{results?.gameOver ? '🎮 Game Over!' : '📊 Quiz Summary'}</h1>
          
          <div className="final-score">
            <span className="score-label">Final Score</span>
            <span className="score-number">{results?.totalScore || 0}</span>
          </div>

          <p className="result-message">
            {results?.message || 'Great job playing!'}
          </p>

          <div className="result-stats">
            <div className="result-stat">
              <span className="value">{results?.roundsCompleted || roundNumber}</span>
              <span className="label">Rounds Played</span>
            </div>
            {results?.roundsWon !== undefined && (
              <div className="result-stat">
                <span className="value">{results.roundsWon}</span>
                <span className="label">Correct Guesses</span>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => {
                setGameState(GAME_STATE.START)
                setResults(null)
              }} 
              className="btn btn-primary btn-large"
            >
              Play Again
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="btn btn-secondary"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default Quiz
