import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

let currentAccessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token
}

export const getAccessToken = () => currentAccessToken

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to inject Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (currentAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to attempt token refresh on 401
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If 401 and request was not already a retry or refresh call
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh') &&
      !originalRequest.url?.includes('/api/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_API_URL || ''}/api/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const newToken = data.accessToken
        setAccessToken(newToken)
        processQueue(null, newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        setAccessToken(null)
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
