import { createContext } from 'react'
import type { LoginCredentials, RegisterFormData, User } from '../types/auth'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<User>
  register: (data: RegisterFormData) => Promise<User>
  logout: () => Promise<void>
  updateProfile: (name?: string, profilePicture?: File | null) => Promise<User>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
