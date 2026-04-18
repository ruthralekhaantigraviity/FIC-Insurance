import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext.jsx'

export default function Header() {
  const { user, logout } = useContext(AuthContext)
  return (
    <header className="header-bar">
      <div>
        <h1>Insurance CRM</h1>
        <p className="subtitle">Lead management and employee performance dashboard</p>
      </div>
      <div className="profile-row">
        <div className="role-chip">{user?.role?.replace('_', ' ').toUpperCase()}</div>
        <button className="btn-secondary" onClick={logout}>Sign out</button>
      </div>
    </header>
  )
}
