import React, { useEffect, useState } from 'react'
import { api, setAccessToken } from '../lib/api'
import type { AuthResponse, LoginCredentials, RegisterFormData, User } from '../types/auth'
import { AuthContext } from './AuthContextInstance'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleAuthSuccess = (authData: AuthResponse) => {
    setToken(authData.accessToken)
    setAccessToken(authData.accessToken)
    setUser(authData.user)
  }

  useEffect(() => {
    let isMounted = true

    const bootstrapAuth = async () => {
      try {
        const response = await api.post<AuthResponse>('/api/auth/refresh')
        if (isMounted) {
          handleAuthSuccess(response.data)
        }
      } catch {
        if (isMounted) {
          setToken(null)
          setAccessToken(null)
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    bootstrapAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<User> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials)
    handleAuthSuccess(response.data)
    return response.data.user
  }

  const register = async (data: RegisterFormData): Promise<User> => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('password', data.password)

    if (data.profilePicture) {
      formData.append('profilePicture', data.profilePicture)
    }

    const response = await api.post<AuthResponse>('/api/auth/register', formData)

    handleAuthSuccess(response.data)
    return response.data.user
  }

  const logout = async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      setToken(null)
      setAccessToken(null)
      setUser(null)
    }
  }

  const updateProfile = async (name?: string, profilePicture?: File | null): Promise<User> => {
    const formData = new FormData()
    if (name) {
      formData.append('name', name)
    }
    if (profilePicture) {
      formData.append('profilePicture', profilePicture)
    }

    const response = await api.put<User>('/api/auth/profile', formData)

    setUser(response.data)
    return response.data
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.get<User>('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
