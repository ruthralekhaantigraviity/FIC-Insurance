import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import { toast } from 'react-toastify'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('admin@fic.com')
  const [password, setPassword] = useState('Password123')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await login(email, password)
      navigate(response.user.role === 'admin' ? '/admin' : '/employee')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-center">
      <div className="card card-large">
        <h2>Sign in to FIC CRM</h2>
        <p>Admin / Employee portal for insurance leads and conversion tracking.</p>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          </label>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
