interface User {
  id: number
  fullName: string
  email: string
  createdAt: string
  updatedAt: string | null
}

interface AuthResponse {
  message: string
  user?: User
  isAuthenticated?: boolean
}

interface RegisterData {
  fullName: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

interface ApiError {
  message: string
  errors?: Array<{
    field: string
    message: string
  }>
}

import { tuyauUtils, API_ENDPOINTS } from './tuyau'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

class AuthService {
  constructor() {
    // Tuyau client is already configured with base URL and global settings
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // TODO: Replace with: const result = await tuyau.api.v1.users.$post(data)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'L\'opération a échoué')
      }

      // Store user data if registration was successful
      if (result.user) {
        this.handleAuthSuccess(result)
      }

      return result
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Login a user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // TODO: Replace with: const result = await tuyau.api.v1.sessions.$post(data)
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Email ou mot de passe incorrect')
      }

      // Store user data if login was successful
      if (result.user) {
        this.handleAuthSuccess(result)
      }

      return result
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<{ message: string }> {
    try {
      // TODO: Replace with: const result = await tuyau.api.v1.sessions.$delete()
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'L\'opération a échoué')
      }

      // Clear local auth data
      this.handleAuthLogout()

      return result
    } catch (error) {
      // Even if logout fails on server, clear local data
      this.handleAuthLogout()
      throw this.handleError(error)
    }
  }

  /**
   * Check if user is authenticated
   */
  async checkAuth(): Promise<AuthResponse> {
    try {
      // TODO: Replace with: const result = await tuyau.api.v1.sessions.$get()
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.CHECK}`, {
        method: 'GET',
        credentials: 'include',
      })

      const result = await response.json()

      // Note: 401 is expected when not authenticated, so we don't throw
      if (response.status === 401) {
        this.handleAuthLogout()
        return {
          message: result.message,
          isAuthenticated: false,
        }
      }

      if (!response.ok) {
        throw new Error(result.message || 'Échec de l\'authentification')
      }

      // Update local auth data if check was successful
      if (result.user) {
        this.handleAuthSuccess(result)
      }

      return result
    } catch (error) {
      // If auth check fails, assume not authenticated
      this.handleAuthLogout()
      throw this.handleError(error)
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(authData: AuthResponse): void {
    if (authData.user) {
      // Store user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(authData.user))
      }
    }
  }

  /**
   * Handle logout or authentication failure
   */
  private handleAuthLogout(): void {
    // Clear all auth-related data using tuyau utils
    tuyauUtils.clearAuth()
  }

  /**
   * Handle and format errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error
    }

    if (typeof error === 'string') {
      return new Error(error)
    }

    return new Error('Une erreur inattendue s\'est produite')
  }

  /**
   * Get current user data from localStorage
   */
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  /**
   * Check if user is authenticated (client-side check)
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}

// Export a singleton instance
export const authService = new AuthService()

// Export types for use in components
export type { User, AuthResponse, RegisterData, LoginData, ApiError } 