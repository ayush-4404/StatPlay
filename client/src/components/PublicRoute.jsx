import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function PublicRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/profile" replace />
  }

  return children
}

export default PublicRoute
