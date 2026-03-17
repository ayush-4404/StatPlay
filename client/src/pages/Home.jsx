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
                {user?.isAdmin && (
                  <Link to="/admin" className="nav-link">⚙️ Admin</Link>
                )}
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
            <div className="feature feature-stat">
              <span className="feature-icon">📊</span>
              <h3>Stat-Based Guessing</h3>
              <p>Use cricket statistics to identify famous players</p>
            </div>
            <div className="feature feature-target">
              <span className="feature-icon">🎯</span>
              <h3>3 Attempts Per Round</h3>
              <p>Fewer attempts = more points (10, 7, or 5)</p>
            </div>
            <div className="feature feature-endless">
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
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 3rem;
        }
        .feature {
          position: relative;
          overflow: hidden;
          padding: 1.35rem 1.2rem 1.3rem;
          background: linear-gradient(170deg, rgba(4, 18, 40, 0.88), rgba(3, 11, 26, 0.92));
          border-radius: 1.05rem;
          border: 1px solid rgba(180, 225, 255, 0.2);
          box-shadow: 0 14px 28px rgba(0, 6, 20, 0.45);
          backdrop-filter: blur(8px);
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .feature::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.85;
          pointer-events: none;
        }
        .feature::after {
          content: '';
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 999px;
          top: -52px;
          right: -44px;
          filter: blur(0.5px);
          opacity: 0.45;
          pointer-events: none;
        }
        .feature:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 34px rgba(1, 7, 24, 0.5);
          border-color: rgba(198, 235, 255, 0.42);
        }
        .feature-stat::before {
          background: linear-gradient(145deg, rgba(38, 215, 162, 0.15), transparent 65%);
        }
        .feature-stat::after {
          background: radial-gradient(circle, rgba(38, 215, 162, 0.7), rgba(38, 215, 162, 0));
        }
        .feature-target::before {
          background: linear-gradient(145deg, rgba(77, 171, 255, 0.16), transparent 65%);
        }
        .feature-target::after {
          background: radial-gradient(circle, rgba(77, 171, 255, 0.75), rgba(77, 171, 255, 0));
        }
        .feature-endless::before {
          background: linear-gradient(145deg, rgba(255, 190, 76, 0.17), transparent 65%);
        }
        .feature-endless::after {
          background: radial-gradient(circle, rgba(255, 190, 76, 0.75), rgba(255, 190, 76, 0));
        }
        .feature-icon {
          width: 3.2rem;
          height: 3.2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.7rem;
          margin-bottom: 0.9rem;
          border-radius: 999px;
          background: rgba(7, 30, 62, 0.75);
          border: 1px solid rgba(196, 232, 255, 0.27);
          box-shadow: inset 0 0 18px rgba(148, 220, 255, 0.14);
        }
        .feature h3 {
          font-size: 1.23rem;
          margin-bottom: 0.42rem;
          color: #f2f8ff;
          letter-spacing: 0.01em;
          position: relative;
          z-index: 1;
        }
        .feature p {
          color: rgba(219, 235, 250, 0.88);
          font-size: 0.92rem;
          line-height: 1.45;
          position: relative;
          z-index: 1;
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
