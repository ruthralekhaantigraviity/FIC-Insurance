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

export default api
