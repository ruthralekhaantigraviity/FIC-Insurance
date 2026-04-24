import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, TrendingUp, CheckCircle, 
  Clock, AlertCircle, PieChart as PieIcon, BarChart as BarIcon,
  Calendar, MapPin, Activity, Download,
  ArrowUpRight, ArrowDownRight, Briefcase, Zap,
  Search, Shield, Bell, ChevronRight, X, UserCheck,
  PhoneCall, Heart, Send, Banknote, CreditCard, Laptop, FileText, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, LineChart, Line
} from 'recharts';
import { toast } from 'react-toastify';

const StatCard = ({ label, value, icon: Icon, color, bgColor, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="card card-hover flex flex-col justify-between min-h-[110px]"
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-black text-[var(--text-main)] tracking-tight">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${bgColor}`}>
        <Icon size={20} className={color} />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('kpis'); // 'kpis' or 'team'
  const [performanceData, setPerformanceData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [policyData, setPolicyData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [reportSummary, setReportSummary] = useState('');
  const [callStats, setCallStats] = useState(null);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [selectedTL, setSelectedTL] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDashboardData();
    fetchCallStats();
    if (user?.role !== 'employee') {
      fetchPerformanceData();
      fetchTeamLeaders();
    }
    if (user?.role === 'admin') fetchBranches();
  }, [user, selectedBranch, selectedTL, selectedDate]);

  const fetchTeamLeaders = async () => {
    try {
      const res = await api.get('/users/team-leaders');
      setTeamLeaders(res.data);
    } catch (err) {}
  };

  const fetchCallStats = async () => {
    try {
      const res = await api.get(`/calls/stats?branch=${selectedBranch}&teamLeader=${selectedTL}&date=${selectedDate}`);
      setCallStats(res.data);
    } catch (err) {
      console.error('Failed to fetch call stats');
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/users/branches');
      setBranches(res.data);
    } catch (err) {}
  };

  const fetchPerformanceData = async () => {
    try {
      const res = await api.get(`/reports/performance?branch=${selectedBranch}&date=${selectedDate}`);
      setPerformanceData(res.data);
    } catch (err) {
      console.error('Failed to fetch team performance');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const res = await api.get(`/reports/dashboard?branch=${selectedBranch}&date=${selectedDate}`);
      const data = res.data;
      setStats(data);
      if (data.categoryStats) setPolicyData(data.categoryStats);
      if (data.conversionHistory) setChartData(data.conversionHistory);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportSummary.trim()) return toast.warning('Please enter a summary');
    
    setIsSubmitting(true);
    try {
      await api.post('/reports/daily', {
        summary: reportSummary,
        statsSnapshot: {
          calls: stats?.todayCallsDone || 0,
          interested: stats?.interestedLeads || 0,
          issued: (stats?.odCount || 0) + (stats?.thirdPartyCount || 0)
        }
      });
      toast.success('Daily Operation Log Injected Successfully');
      setReportSummary('');
    } catch (err) {
      toast.error('Failed to submit daily report');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 rounded-2xl"></div>
          <div className="absolute top-0 w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-2xl animate-spin"></div>
        </div>
        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Terminal...</span>
      </div>
    </div>
  );

  const odCount = stats?.categoryStats?.find(c => c.name === 'Motor (OD)')?.value || 0;
  const tpCount = stats?.categoryStats?.find(c => c.name === 'Motor (TP)')?.value || 0;

  const adminStats = [
    { label: 'Total Leads',           value: stats?.totalLeads         || 0,  icon: Users,       bgColor: 'bg-blue-100',    color: 'text-blue-600',    delay: 0.05 },
    { label: 'Called Leads',          value: stats?.calledLeads        || 0,  icon: PhoneCall,   bgColor: 'bg-sky-100',     color: 'text-sky-600',     delay: 0.10 },
    { label: 'Interested Leads',      value: stats?.interestedLeads    || 0,  icon: Heart,       bgColor: 'bg-pink-100',    color: 'text-pink-600',    delay: 0.15 },
    { label: 'Payment Links Sent',    value: stats?.paymentLinksSent   || 0,  icon: Send,        bgColor: 'bg-violet-100',  color: 'text-violet-600',  delay: 0.20 },
    { label: 'Payments Completed',    value: stats?.paymentsCompleted  || 0,  icon: CheckCircle, bgColor: 'bg-green-100',   color: 'text-green-600',   delay: 0.25 },
    { label: 'OD Insurance',          value: odCount,                         icon: Shield,      bgColor: 'bg-amber-100',   color: 'text-amber-600',   delay: 0.30 },
    { label: 'Third Party Insurance', value: tpCount,                         icon: Briefcase,   bgColor: 'bg-orange-100',  color: 'text-orange-600',  delay: 0.35 },
    { label: 'Total Incentives',      value: `₹${(stats?.totalIncentives || 0).toLocaleString()}`, icon: Banknote,    bgColor: 'bg-emerald-100', color: 'text-emerald-600', delay: 0.40 },
    { label: 'Premium Volume',        value: `₹${(stats?.totalPremium   || 0).toLocaleString()}`, icon: CreditCard,  bgColor: 'bg-indigo-100',  color: 'text-indigo-600',  delay: 0.45 },
    { label: 'Total Calls',           value: callStats?.summary?.totalCalls || 0, icon: PhoneCall, bgColor: 'bg-blue-100', color: 'text-blue-600', delay: 0.50 },
    { label: 'Interested',            value: callStats?.summary?.interested || 0, icon: Heart, bgColor: 'bg-pink-100', color: 'text-pink-600', delay: 0.55 },
    { label: 'Not Interested',        value: callStats?.summary?.notInterested || 0, icon: X, bgColor: 'bg-red-100', color: 'text-red-600', delay: 0.60 },
    { label: 'Paid Calls',            value: callStats?.summary?.paidCalls || 0, icon: CreditCard, bgColor: 'bg-green-100', color: 'text-green-600', delay: 0.65 },
    { label: 'Non-Paid Calls',        value: callStats?.summary?.nonPaidCalls || 0, icon: AlertCircle, bgColor: 'bg-gray-100', color: 'text-gray-600', delay: 0.70 },
  ];

  const employeeStats = [
    { label: 'Total Calls',           value: callStats?.summary?.totalCalls || 0,  icon: PhoneCall,   bgColor: 'bg-blue-100',    color: 'text-blue-600',    delay: 0.05 },
    { label: 'Interested',            value: callStats?.summary?.interested || 0,  icon: Heart,       bgColor: 'bg-pink-100',    color: 'text-pink-600',    delay: 0.10 },
    { label: 'Not Interested',        value: callStats?.summary?.notInterested || 0, icon: X, bgColor: 'bg-red-100', color: 'text-red-600', delay: 0.15 },
    { label: 'Paid Calls',            value: callStats?.summary?.paidCalls  || 0,  icon: Banknote,    bgColor: 'bg-green-100',   color: 'text-green-600',   delay: 0.20 },
    { label: 'Non-Paid Calls',        value: callStats?.summary?.nonPaidCalls || 0, icon: AlertCircle, bgColor: 'bg-orange-100',  color: 'text-orange-600',  delay: 0.25 },
    { label: 'Completed',             value: callStats?.summary?.completed || 0, icon: CheckCircle, bgColor: 'bg-emerald-100', color: 'text-emerald-600', delay: 0.30 },
    { label: 'Not Picking',           value: callStats?.summary?.unreachable || 0, icon: Clock, bgColor: 'bg-gray-100', color: 'text-gray-600', delay: 0.35 },
    { label: 'Total Incentives',      value: `₹${(stats?.totalIncentives || 0).toLocaleString()}`, icon: Award,    bgColor: 'bg-indigo-100', color: 'text-indigo-600', delay: 0.40 },
  ];

  const defaultChartData = [
    { name: 'Mon', count: 0 }, { name: 'Tue', count: 0 }, { name: 'Wed', count: 0 },
    { name: 'Thu', count: 0 }, { name: 'Fri', count: 0 }, { name: 'Sat', count: 0 }, { name: 'Sun', count: 0 },
  ];

  const isEmployee = user?.role === 'employee';

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[var(--bg-card)] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
              {isEmployee ? 'Performance Terminal' : 'Admin Dashboard'}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <Activity size={12} className="text-green-500" />
              Live Stream
            </div>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[var(--text-main)] mb-2 italic">
            {isEmployee ? 'Fueling Growth,' : 'Good Day,'} {user?.name?.split(' ')[0] || 'User'} 🚀
          </h2>
          <p className="text-[var(--text-muted)] font-medium text-sm sm:text-base max-w-xl">
            {isEmployee 
              ? 'Your conversion metrics and daily objectives are synchronized.' 
              : "Complete overview of your team's performance and lead pipeline."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          {user?.role === 'admin' && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 border-r border-[var(--border-light)] pr-3 mr-1">
                <MapPin size={14} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Branch</span>
              </div>
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-[var(--text-main)] font-bold text-xs outline-none cursor-pointer hover:text-primary transition-colors min-w-[100px]"
              >
                <option value="All">All Branches</option>
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
          {user?.role === 'admin' && (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 border-r border-[var(--border-light)] pr-3 mr-1">
                <Users size={14} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Team Leader</span>
              </div>
              <select 
                value={selectedTL}
                onChange={(e) => setSelectedTL(e.target.value)}
                className="bg-transparent text-[var(--text-main)] font-bold text-xs outline-none cursor-pointer hover:text-primary transition-colors min-w-[120px]"
              >
                <option value="">All Team Leaders</option>
                {teamLeaders.map(tl => (
                  <option key={tl._id} value={tl._id}>{tl.name}</option>
                ))}
              </select>
            </div>
          )}
          {!isEmployee && (
            <button 
              onClick={() => window.open('/api/reports/export/leads', '_blank')}
              className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-105 transition-all"
            >
              <Download size={18} />
              Export CSV
            </button>
          )}
          <div className="flex items-center gap-3 px-5 py-3 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-light)] focus-within:border-primary transition-all group">
            <Calendar size={18} className="text-primary" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-black text-[var(--text-main)] font-mono uppercase tracking-widest cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs (For Admin/TL) */}
      {!isEmployee && (
        <div className="flex items-center gap-2 sm:gap-4 bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-light)] w-fit">
          <button 
            onClick={() => setActiveTab('kpis')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'kpis' ? 'bg-gray-900 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            KPI Terminal
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'bg-gray-900 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            Team Matrix
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {activeTab === 'kpis' ? (
          <motion.div 
            key="kpis"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* KPI Cards Row */}
            {isEmployee ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
                {employeeStats.map((stat, i) => <StatCard key={i} {...stat} />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5">
                  {adminStats.slice(0, 5).map((stat, i) => <StatCard key={i} {...stat} />)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                  {adminStats.slice(5).map((stat, i) => <StatCard key={i} {...stat} />)}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
              {/* Charts area remains same */}
              {/* Charts / Reporting */}
              <div className="lg:col-span-2 space-y-8">
                {/* Conversion Trend Chart */}
                <div className="card !p-8">
                  <div className="mb-8">
                    <h3 className="text-xl font-black text-[var(--text-main)] flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <BarIcon size={20} />
                      </div>
                      Yield Velocity
                    </h3>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest">Historical conversion performance</p>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.length > 0 ? chartData : defaultChartData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} dy={15} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} dx={-10} />
                        <Tooltip 
                          cursor={{stroke: '#2563eb', strokeWidth: 1, strokeDasharray: '4 4'}}
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '12px 16px'}}
                          itemStyle={{fontWeight: 900, fontSize: '12px'}}
                          labelStyle={{fontWeight: 900, marginBottom: '6px', color: '#64748B'}}
                        />
                        <Area type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Daily Performance Injection (For Employees) */}
                {isEmployee && (
                  <div className="card !p-8 border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32"></div>
                    <div className="mb-6 relative z-10">
                      <h3 className="text-xl font-black flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 backdrop-blur-md border border-white/10">
                          <Laptop size={20} />
                        </div>
                        EOD Performance Injection
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-[0.2em]">Authorize your daily operational log</p>
                    </div>
                    
                    <form onSubmit={handleReportSubmit} className="relative z-10 space-y-4">
                        <div className="relative group">
                          <div className="absolute top-4 left-4 text-blue-400 group-focus-within:text-blue-300 transition-colors">
                            <FileText size={18} />
                          </div>
                          <textarea 
                            value={reportSummary}
                            onChange={(e) => setReportSummary(e.target.value)}
                            placeholder="Summarize your daily achievements, roadblocks or insights..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 h-32 text-sm text-slate-200 outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 font-medium"
                          />
                        </div>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <Activity className="animate-spin" size={16} />
                          ) : (
                            <>
                              <Send size={16} />
                              Instate Operation Log
                            </>
                          )}
                        </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Portfolio / Leaderboard Side */}
              <div className="space-y-8">
                {/* Portfolio Mix */}
                <div className="card !p-8 bg-blue-600 border-none text-white shadow-xl shadow-blue-500/20 relative overflow-hidden flex flex-col">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                  <div className="mb-6 relative z-10">
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <PieIcon size={20} />
                      </div>
                      Segment Matrix
                    </h3>
                    <p className="text-[10px] font-bold text-white/60 mt-1 uppercase tracking-widest">Current portfolio distribution</p>
                  </div>
                  <div className="h-[200px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={policyData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={6} dataKey="value">
                          {policyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', background: '#FFFFFF', color: '#000000'}} itemStyle={{color: '#000000', fontWeight: 900}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 relative z-10">
                    {policyData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/10 border border-white/10">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-wider text-white/50">{item.name}</p>
                          <p className="text-xs font-black text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Leaderboard */}
                <div className="card !p-6 border-none shadow-sm overflow-hidden bg-[var(--bg-card)]">
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-[var(--text-main)] flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Award size={18} />
                      </div>
                      Elite Ranking
                    </h3>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-widest">Today's top performers</p>
                  </div>
                  <div className="space-y-4">
                    {(stats?.dailyTopPerformers || []).length === 0 ? (
                      <div className="py-8 text-center text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest opacity-50">
                        Initializing...
                      </div>
                    ) : (stats?.dailyTopPerformers || []).map((agent, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-main)] border border-[var(--border-light)] group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                              {agent.name?.charAt(0)}
                            </div>
                            {i === 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-[var(--bg-card)] shadow-sm"></div>}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[var(--text-main)] leading-none">{agent.name}</p>
                            <p className="text-[9px] font-medium text-[var(--text-muted)] mt-1">₹{(agent.incentives || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-primary italic leading-none">{agent.conversions || 0}</p>
                          <p className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tighter mt-1">Issued</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="team"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="card !p-0 overflow-hidden border-none shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent</th>
                      <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch</th>
                      <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Calls</th>
                      <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Interest</th>
                      <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Conv.</th>
                      <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume</th>
                      <th className="px-6 sm:px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incentive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {performanceData.map((agent, i) => (
                      <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                        <td className="px-6 sm:px-10 py-4 sm:py-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                              {agent.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm mb-0.5">{agent.name}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{agent.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 sm:px-10 py-4 sm:py-6">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">{agent.branch}</span>
                        </td>
                        <td className="px-6 sm:px-10 py-4 sm:py-6 font-bold text-gray-900">{agent.calls || 0}</td>
                        <td className="px-6 sm:px-10 py-4 sm:py-6 font-bold text-pink-600">{agent.interested || 0}</td>
                        <td className="px-6 sm:px-10 py-4 sm:py-6 font-bold text-gray-900">{agent.conversions || 0}</td>
                        <td className="px-6 sm:px-10 py-4 sm:py-6 font-bold text-gray-900 whitespace-nowrap">₹{(agent.premium || 0).toLocaleString()}</td>
                        <td className="px-6 sm:px-10 py-4 sm:py-6">
                          <span className="font-black text-primary italic whitespace-nowrap">₹{(agent.incentives || 0).toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
