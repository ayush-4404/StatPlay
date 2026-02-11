import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await api.get('/users/current-user')
        if (response.data.success) {
          setUser(response.data.data)
          localStorage.setItem('user', JSON.stringify(response.data.data))
        }
      } catch (error) {
        // Token invalid or expired
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = useCallback(async (identifier, password) => {
    const isEmail = identifier.includes('@')
    const payload = isEmail
      ? { email: identifier, password }
      : { username: identifier, password }

    const response = await api.post('/users/login', payload)

    if (response.data.success) {
      const { user: userData, accessToken } = response.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return { success: true, user: userData }
    }

    throw new Error(response.data.message || 'Login failed')
  }, [])

  // Register function
  const register = useCallback(async (formData) => {
    const response = await api.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await api.post('/users/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setUser(null)
    }
  }, [])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/users/current-user')
      if (response.data.success) {
        setUser(response.data.data)
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }, [])

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
