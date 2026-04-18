import { NavLink } from 'react-router-dom'

const links = {
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Employees', path: '/admin/employees' },
    { label: 'Leads', path: '/leads' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Reports', path: '/admin/reports' },
  ],
  employee: [
    { label: 'Dashboard', path: '/employee' },
    { label: 'Leads', path: '/leads' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Announcements', path: '/announcements' },
  ],
  team_leader: [
    { label: 'Dashboard', path: '/employee' },
    { label: 'Leads', path: '/leads' },
    { label: 'Tasks', path: '/tasks' },
    { label: 'Announcements', path: '/announcements' },
    { label: 'Reports', path: '/admin/reports' },
  ],
}

export default function Sidebar({ role }) {
  const menu = links[role] || links.employee
  return (
    <aside className="sidebar">
      <div className="brand">FIC CRM</div>
      <nav>
        {menu.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
