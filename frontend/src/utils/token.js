const STORAGE_KEY = 'token'

export function saveToken(token) {
  localStorage.setItem(STORAGE_KEY, token)
}

export function getToken() {
  return localStorage.getItem(STORAGE_KEY)
}

export function removeToken() {
  localStorage.removeItem(STORAGE_KEY)
}

export function decodeToken(token) {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}
