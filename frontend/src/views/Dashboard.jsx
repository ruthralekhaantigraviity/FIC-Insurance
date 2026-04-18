import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, PhoneCall, Heart, Send, 
  CheckCircle, Shield, Briefcase,
  Award, Calendar, MapPin,
  Activity, PieChart as PieIcon, BarChart as BarIcon,
  Download, CreditCard, Banknote, Laptop, FileText
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area,
  PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
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

  useEffect(() => {
    fetchDashboardData();
    if (user?.role !== 'employee') fetchPerformanceData();
    if (user?.role === 'admin') fetchBranches();
  }, [user, selectedBranch]);

  const fetchBranches = async () => {
    setBranches(['Thirupathur', 'Krishanagiri', 'Chennai', 'Bangalore']);
  }

  const fetchPerformanceData = async () => {
    try {
      const res = await axios.get(`/api/reports/performance?branch=${selectedBranch}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPerformanceData(res.data);
    } catch (err) {
      console.error('Failed to fetch team performance');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/reports/dashboard?branch=${selectedBranch}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      await axios.post('/api/reports/daily', {
        summary: reportSummary,
        statsSnapshot: {
          calls: stats?.todayCallsDone || 0,
          interested: stats?.interestedLeads || 0,
          issued: (stats?.odCount || 0) + (stats?.thirdPartyCount || 0)
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
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
  ];

  const employeeStats = [
    { label: 'Today Calls Done',      value: stats?.todayCallsDone     || 0,  icon: PhoneCall,   bgColor: 'bg-blue-100',    color: 'text-blue-600',    delay: 0.05 },
    { label: 'Interested Customers',  value: stats?.interestedLeads    || 0,  icon: Heart,       bgColor: 'bg-pink-100',    color: 'text-pink-600',    delay: 0.10 },
    { label: 'Payment Completed',     value: stats?.paymentsCompleted  || 0,  icon: CheckCircle, bgColor: 'bg-green-100',   color: 'text-green-600',   delay: 0.15 },
    { label: 'OD Conversions',        value: odCount,                         icon: Shield,      bgColor: 'bg-amber-100',   color: 'text-amber-600',   delay: 0.20 },
    { label: 'Third Party Conv.',     value: tpCount,                         icon: Briefcase,   bgColor: 'bg-orange-100',  color: 'text-orange-600',  delay: 0.25 },
    { label: 'Total Incentives',      value: `₹${(stats?.totalIncentives || 0).toLocaleString()}`, icon: Banknote,    bgColor: 'bg-emerald-100', color: 'text-emerald-600', delay: 0.30 },
  ];

  const defaultChartData = [
    { name: 'Mon', count: 0 }, { name: 'Tue', count: 0 }, { name: 'Wed', count: 0 },
    { name: 'Thu', count: 0 }, { name: 'Fri', count: 0 }, { name: 'Sat', count: 0 }, { name: 'Sun', count: 0 },
  ];

  const isEmployee = user?.role === 'employee';

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[var(--bg-card)] p-8 rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest">
              {isEmployee ? 'Performance Terminal' : 'Admin Dashboard'}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <Activity size={12} className="text-green-500" />
              Live Stream
            </div>
          </div>
          <h2 className="text-4xl font-black text-[var(--text-main)] mb-2 italic">
            {isEmployee ? 'Fueling Growth,' : 'Good Day,'} {user?.name?.split(' ')[0] || 'User'} 🚀
          </h2>
          <p className="text-[var(--text-muted)] font-medium max-w-xl">
            {isEmployee 
              ? 'Your conversion metrics and daily objectives are synchronized. Focus on the high-intent pipeline.' 
              : "Here's a complete overview of your team's performance and lead pipeline today."}
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex items-center gap-4">
          {user?.role === 'admin' && (
            <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 border-r border-[var(--border-light)] pr-3 mr-1">
                <MapPin size={14} className="text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Branch</span>
              </div>
              <select 
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-transparent text-[var(--text-main)] font-bold text-xs outline-none cursor-pointer hover:text-primary transition-colors min-w-[120px]"
              >
                <option value="All">All Branches</option>
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
          {!isEmployee && (
            <button 
              onClick={() => window.open('/api/reports/export/leads', '_blank')}
              className="flex items-center gap-3 px-6 py-3.5 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl font-bold text-xs text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-all shadow-sm"
            >
              <Download size={16} />
              Export Audit
            </button>
          )}
          <div className="flex items-center gap-3 px-5 py-3.5 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-light)]">
            <Calendar size={18} className="text-primary" />
            <span className="text-sm font-black text-[var(--text-main)] font-mono">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (For Admin/TL) */}
      {!isEmployee && (
        <div className="flex items-center gap-4 bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-light)] w-fit">
          <button 
            onClick={() => setActiveTab('kpis')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'kpis' ? 'bg-gray-900 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            KPI Terminal
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'team' ? 'bg-gray-900 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
          >
            Management Matrix
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
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                {employeeStats.map((stat, i) => <StatCard key={i} {...stat} />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-5">
                  {adminStats.slice(0, 5).map((stat, i) => <StatCard key={i} {...stat} />)}
                </div>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
                  {adminStats.slice(5).map((stat, i) => <StatCard key={i} {...stat} />)}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Agent</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Branch / Team</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Conversions</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume (INR)</th>
                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incentive Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white">
                  {performanceData.map((agent, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                            {agent.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 mb-0.5">{agent.name}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{agent.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{agent.branch} • {agent.team || 'None'}</span>
                      </td>
                      <td className="px-10 py-6 font-bold text-gray-900">{agent.conversions || 0}</td>
                      <td className="px-10 py-6 font-bold text-gray-900">₹{(agent.premium || 0).toLocaleString()}</td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-primary italic">₹{(agent.incentives || 0).toLocaleString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
