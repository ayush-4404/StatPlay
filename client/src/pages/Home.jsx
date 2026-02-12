import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="home-page">
      <nav className="navbar">
        <div className="container navbar-content">
          <Link to="/" className="logo">🏏 StatPlay</Link>
          <div className="nav-links">
            <Link to="/leaderboard" className="nav-link">🏆 Leaderboard</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-link">Profile</Link>
                <Link to="/quiz" className="btn btn-primary">Play Quiz</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="hero">
        <div className="container hero-content">
          <h1>Test Your Cricket Knowledge</h1>
          <p className="hero-subtitle">
            Guess the cricketer from their stats. The fewer attempts you need, the higher your score!
          </p>
          
          <div className="features">
            <div className="feature">
              <span className="feature-icon">📊</span>
              <h3>Stat-Based Guessing</h3>
              <p>Use cricket statistics to identify famous players</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <h3>3 Attempts Per Round</h3>
              <p>Fewer attempts = more points (10, 7, or 5)</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🏆</span>
              <h3>Endless Mode</h3>
              <p>Keep playing until you miss. Beat your high score!</p>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="cta-section">
              <p className="welcome-text">Welcome back, {user?.name}!</p>
              <Link to="/quiz" className="btn btn-primary btn-large">Start Playing</Link>
            </div>
          ) : (
            <div className="cta-section">
              <Link to="/register" className="btn btn-primary btn-large">Create Account</Link>
              <Link to="/login" className="btn btn-secondary btn-large">Sign In</Link>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .home-page {
          min-height: 100vh;
          background: url('/images/statPlay%20bg.jpg') no-repeat center center;
          background-size: cover;
          background-attachment: fixed;
          position: relative;
        }
        .home-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(3px);
          z-index: 0;
        }
        .navbar {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 1;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }
        .navbar-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
        }
        .logo:hover {
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }
        .nav-link:hover {
          color: white;
        }
        .hero {
          padding: 4rem 0;
          position: relative;
          z-index: 1;
        }
        .hero-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }
        .hero h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 3rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .feature {
          padding: 1.5rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .feature-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 1rem;
        }
        .feature h3 {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          color: white;
        }
        .feature p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }
        .cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .welcome-text {
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 0.5rem;
          font-size: 1.125rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
        }
        .btn-large {
          padding: 1rem 2rem;
          font-size: 1.125rem;
        }
        .cta-section .btn {
          min-width: 200px;
        }
        @media (max-width: 640px) {
          .hero h1 {
            font-size: 2rem;
          }
          .hero-subtitle {
            font-size: 1rem;
          }
          .features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default Home
