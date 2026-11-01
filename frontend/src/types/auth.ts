export interface User {
  id: string
  name: string
  email: string
  profilePictureUrl: string | null
  role: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword?: string
  profilePicture?: File | null
}

export type Theme = 'light' | 'dark'
