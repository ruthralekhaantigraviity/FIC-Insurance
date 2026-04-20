import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
if (apiBaseUrl && apiBaseUrl.startsWith('http')) {
  // Many existing calls use axios with '/api/*' paths.
  // Set baseURL to the API origin so those requests resolve in production too.
  axios.defaults.baseURL = apiBaseUrl.replace(/\/api\/?$/, '')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
