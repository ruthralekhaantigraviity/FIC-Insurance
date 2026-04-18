import { Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext.jsx'
import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

export default function MainLayout() {
  const { user } = useContext(AuthContext)

  return (
    <div className="app-shell">
      <Sidebar role={user?.role} />
      <div className="main-content">
        <Header />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
