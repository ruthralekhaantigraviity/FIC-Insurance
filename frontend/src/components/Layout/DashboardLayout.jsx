import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AnnouncementBanner from '../common/AnnouncementBanner';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart2, Users, FileText, Bell, 
  MessageSquare, Layout, LogOut, Info,
  ChevronRight, Search, Zap, Shield, Download,
  Sun, Moon, CreditCard, ShieldCheck, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group ${
      active 
        ? 'bg-blue-800 shadow-lg text-white' 
        : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 group-hover:bg-white/20 group-hover:text-white'}`}>
        <Icon size={18} />
      </div>
      <span className="font-bold tracking-tight text-sm">{label}</span>
    </div>
    {active && (
      <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-blue-300" />
    )}
  </Link>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(Array.isArray(res.data) ? res.data.slice(0, 2) : []);
      } catch (err) {}
    };
    if (user) fetchAnnouncements();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: Layout, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/tasks', icon: FileText, label: 'Tasks' },
    { to: '/incentives', icon: Zap, label: 'Incentives' },
    { to: '/announcements', icon: Bell, label: 'Updates' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/employees', icon: Users, label: 'Staff' });
    navItems.push({ to: '/payments', icon: CreditCard, label: 'Payments' });
    navItems.push({ to: '/policies', icon: ShieldCheck, label: 'Policies' });
    navItems.push({ to: '/performance-reports', icon: PieChart, label: 'Reports' });
  }

  return (
    <div className="flex h-screen bg-[var(--bg-main)] transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 bg-blue-600 dark:bg-blue-950 m-4 mr-0 rounded-[2.5rem] flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
        
        <div className="p-8 pb-10 flex items-center space-x-3 relative z-10">
          <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield size={24} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white leading-none tracking-tighter uppercase">FIC Elite</span>
            <span className="text-[10px] font-bold text-blue-300 dark:text-slate-500 tracking-[0.2em] uppercase mt-1">CRM Core</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto relative z-10 mt-2">
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest px-4 mb-4 opacity-50">Navigation</p>
          {navItems.map((item) => (
            <SidebarLink 
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="p-4 relative z-10 px-4 space-y-2 mt-auto">

          <button 
            onClick={handleLogout}
            className="flex items-center w-full justify-between p-3.5 rounded-2xl transition-all duration-300 group text-red-200/80 hover:bg-red-500/20 hover:text-red-100"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl transition-colors bg-red-500/10 text-red-300/80 group-hover:bg-red-500/30 group-hover:text-red-100">
                <LogOut size={18} />
              </div>
              <span className="font-bold tracking-tight text-sm">Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden p-4">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-[var(--bg-card)] rounded-[2rem] shadow-sm border border-[var(--border-light)] mb-4">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-black text-[var(--text-main)] tracking-tight">
              {navItems.find(i => i.to === location.pathname)?.label || 'Terminal'}
            </h2>
            <div className="hidden md:flex items-center bg-[var(--bg-main)] border border-[var(--border-light)] rounded-2xl px-4 py-2 w-72 group focus-within:border-primary focus-within:bg-[var(--bg-card)] transition-all">
              <Search size={18} className="text-[var(--text-muted)] group-focus-within:text-primary" />
              <input type="text" placeholder="Search entries..." className="bg-transparent border-none outline-none text-sm ml-3 w-full text-[var(--text-main)]" />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)] text-[var(--text-muted)] hover:text-primary transition-all shadow-sm"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div 
              className="relative cursor-pointer hover:scale-110 transition-transform"
              onClick={() => navigate('/announcements')}
            >
              <Bell size={22} className="text-[var(--text-muted)]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-[var(--bg-card)] rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">{announcements.length}</span>
              </div>
            </div>
            
            <div className="h-10 w-px bg-[var(--border-light)]"></div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-[var(--text-main)] leading-none">{user?.name}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{user?.role}</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg border-2 border-[var(--bg-card)]">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>


    </div>
  );
};

export default DashboardLayout;
