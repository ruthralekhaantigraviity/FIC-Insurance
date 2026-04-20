import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
if (rawApiBaseUrl) {
  let normalizedApiBaseUrl = rawApiBaseUrl

  // Accept values like "my-api.onrender.com/api" or "//my-api.onrender.com/api".
  if (normalizedApiBaseUrl.startsWith('//')) {
    normalizedApiBaseUrl = `https:${normalizedApiBaseUrl}`
  } else if (!/^https?:\/\//i.test(normalizedApiBaseUrl)) {
    normalizedApiBaseUrl = `https://${normalizedApiBaseUrl}`
  }

  // Many existing calls use axios with '/api/*' paths.
  // Set baseURL to the API origin so those requests resolve in production too.
  axios.defaults.baseURL = normalizedApiBaseUrl.replace(/\/api\/?$/, '')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
