import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async (retries = 3) => {
      try {
        setLoading(true)
        
        // Only try to get current user if we have a token
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setUser(null)
          setLoading(false)
          return
        }
        
        const res = await api.get('/users/current-user')
        if (res.data.success) {
          setUser(res.data.data)
          localStorage.setItem('user', JSON.stringify(res.data.data))
        } else {
          setUser(null)
        }
      } catch (err) {
        // Retry on connection refused (backend not ready yet)
        if (retries > 0 && (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error'))) {
          console.log(`Backend not ready, retrying... (${retries} attempts left)`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return initAuth(retries - 1)
        }
        // Not logged in or other error - just set user to null
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])


  const login = async (identifier, password) => {
    // Check if identifier is email or username
    const isEmail = identifier.includes('@')
    const payload = isEmail 
      ? { email: identifier, password }
      : { username: identifier, password }
    
    const response = await api.post('/users/login', payload)
    console.log('Login API Response:', response)
    
    if (response.data.success) {
      const { user, accessToken } = response.data.data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      console.log('User set in context:', user)
      return { success: true, user }
    }
    
    return { success: false, message: response.data.message }
  }

  const register = async (formData) => {
    const response = await api.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  const logout = async () => {
    try {
      await api.post('/users/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await api.get('/users/current-user')
      if (response.data.success) {
        const userData = response.data.data
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

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
