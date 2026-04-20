import axios from 'axios'
import { getToken } from '../utils/token.js'

const normalizeApiBaseUrl = () => {
  const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  if (!rawBaseUrl) return '/api'

  let baseUrl = rawBaseUrl
  if (baseUrl.startsWith('//')) {
    baseUrl = `https:${baseUrl}`
  } else if (!baseUrl.startsWith('/') && !/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`
  }

  baseUrl = baseUrl.replace(/\/+$/, '')
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(),
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Re-authenticating...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Force reload to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
)

export default api
