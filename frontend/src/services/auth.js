import api from './api.js'

export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password })
  return response.data
}

export async function fetchProfile() {
  const response = await api.get('/auth/me')
  return response.data
}
