import { createTuyau } from '@tuyau/client'
import { api } from 'api/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

// Authentication token management
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

const setAuthToken = (token: string | null): void => {
  if (typeof window === 'undefined') return

  if (token) {
    localStorage.setItem('auth_token', token)
  } else {
    localStorage.removeItem('auth_token')
  }
}

// Create the Tuyau client
export const tuyau = createTuyau({
  api,
  baseUrl: API_BASE_URL,
  credentials: 'include',
  timeout: 30_000,
  retry: 3,
  
  hooks: {
    beforeRequest: [
      (request) => {
        // Add authentication token if available
        const token = getAuthToken()
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
        
        // Log requests in development
        if (import.meta.env.DEV) {
          console.log(`[Tuyau] ${request.method} ${request.url}`)
          if (request.body) {
            console.log('[Tuyau] Request body:', request.body)
          }
        }
        
        return request
      }
    ],
    
    afterResponse: [
      (request, options, response) => {
        // Log responses in development
        if (import.meta.env.DEV) {
          console.log(`[Tuyau] ${request.method} ${request.url} - ${response.status}`)
        }
        
        // Handle authentication errors globally
        if (response.status === 401) {
          setAuthToken(null)
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
        
        // Handle server errors globally
        if (response.status >= 500) {
          console.error(`[Tuyau] Server error: ${response.status} ${response.statusText}`)
        }
        
        return response
      }
    ],
    
    beforeError: [
      (error) => {
        // Global error handling
        if (import.meta.env.DEV) {
          console.error('[Tuyau] Request error:', error)
        }
        
        // Network errors
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          error.message = 'Erreur réseau : Veuillez vérifier votre connexion'
        }
        
        // Timeout errors
        if (error.name === 'TimeoutError') {
          error.message = 'Délai d\'attente dépassé : Le serveur met trop de temps à répondre'
        }
        
        return error
      }
    ]
  },
})

// Utility functions for common operations
export const tuyauUtils = {
  // Set auth token globally
  setAuthToken,
  
  // Get auth token
  getAuthToken,
  
  // Clear all auth data
  clearAuth: () => {
    setAuthToken(null)
    // Clear any other auth-related data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_data')
      sessionStorage.clear()
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return getAuthToken() !== null
  },
}

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/sessions',
    LOGOUT: '/api/v1/sessions',
    CHECK: '/api/v1/sessions',
    REGISTER: '/api/v1/users',
  },
  USERS: {
    LIST: '/api/v1/users',
    CREATE: '/api/v1/users',
  }
} as const

// Export types for use in components
export type { InferResponseType, InferErrorType, InferRequestType } from '@tuyau/client'

// Re-export api for type inference
export { api } from 'api/api' 