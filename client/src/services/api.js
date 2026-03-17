import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401 and not already retrying, clear auth and redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      // Only redirect if not already on login/register pages
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

// Admin API functions
export const addCricketer = (formData) => {
  return api.post('/admin/cricketers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const getAllCricketers = (params) => {
  return api.get('/admin/cricketers', { params })
}

export const updateCricketer = (id, formData) => {
  return api.patch(`/admin/cricketers/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export const deleteCricketer = (id) => {
  return api.delete(`/admin/cricketers/${id}`)
}

export const toggleCricketerStatus = (id) => {
  return api.patch(`/admin/cricketers/${id}/toggle-status`)
}

// Auth OTP API functions
export const verifyEmailOtp = (payload) => {
  return api.post('/users/verify-email', payload)
}

export const resendVerificationOtp = (payload) => {
  return api.post('/users/resend-verification', payload)
}

export const requestForgotPasswordOtp = (payload) => {
  return api.post('/users/forgot-password/request-otp', payload)
}

export const resetPasswordWithOtp = (payload) => {
  return api.post('/users/forgot-password/reset', payload)
}
