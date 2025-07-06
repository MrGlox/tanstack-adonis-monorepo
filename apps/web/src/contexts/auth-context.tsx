import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '../lib/auth-service'
import type { User } from '../lib/auth-service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  refreshAuth: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshAuth = async () => {
    try {
      setError(null)
      // First check local storage for quick initialization
      const localUser = authService.getCurrentUser()
      if (localUser) {
        setUser(localUser)
      }

      // Then verify with server
      const response = await authService.checkAuth()
      if (response.isAuthenticated && response.user) {
        setUser(response.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setError(error instanceof Error ? error.message : 'Échec de l\'authentification')
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authService.login({ email, password })
      if (response.user) {
        setUser(response.user)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email ou mot de passe incorrect'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
      // Don't throw on logout errors, just log them
    } finally {
      // Always clear user state on logout
      setUser(null)
      setIsLoading(false)
    }
  }

  const register = async (fullName: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await authService.register({ fullName, email, password })
      if (response.user) {
        setUser(response.user)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'L\'opération a échoué'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true)
      await refreshAuth()
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  // Compute isAuthenticated based on user state
  const isAuthenticated = user !== null

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    refreshAuth,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 