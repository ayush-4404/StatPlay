import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home-container">
      {/* Background Image */}
      <div className="home-bg">
        <img 
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2505&auto=format&fit=crop" 
          alt="Cricket Stadium"
        />
      </div>

      {/* Overlay Content */}
      <div className="home-content">
        <h1 className="home-title">
          Welcome to the Ultimate Cricket Quiz 🏏
        </h1>

        <p className="home-subtitle">
          Test your cricket knowledge. Are you ready?
        </p>

        <div className="home-buttons">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="home-btn primary">
                My Profile
              </Link>
              <Link to="/quiz" className="home-btn secondary">
                Play Quiz
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="home-btn primary">
                Register
              </Link>
              <Link to="/login" className="home-btn secondary">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
