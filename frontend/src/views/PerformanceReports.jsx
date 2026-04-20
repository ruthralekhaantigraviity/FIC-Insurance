import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, TrendingUp, DollarSign, 
  BarChart2, Users, Target,
  Download, Filter, Search, Award,
  ChevronRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

const PerformanceReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/reports/performance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch performance reports', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.premium - a.premium);

  const chartData = filteredReports.slice(0, 5).map(r => ({
    name: r.name?.split(' ')[0],
    premium: r.premium,
    conversions: r.conversions
  }));

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 bg-[var(--bg-card)] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">Efficiency Terminal</h2>
          <p className="text-[var(--text-muted)] font-medium mt-1 text-sm">
            Deep-dive operational metrics, revenue yield, and individual performance benchmarks.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-light)] rounded-2xl font-bold text-xs text-[var(--text-main)] hover:bg-[var(--bg-main)] transition-all shadow-sm">
            <Download size={15} />
            Export Audit
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card !p-8">
           <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-[var(--text-main)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <BarChart2 size={20} />
                  </div>
                  Premium Production (Top 5)
                </h3>
              </div>
           </div>
           <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="premium" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#10B981'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="card bg-primary p-8 text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Award size={120} />
            </div>
            <div className="relative z-10">
              <span className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/80">Monthly Alpha</span>
              <h3 className="text-3xl font-black mt-4 italic tracking-tighter shadow-sm">System Apex</h3>
              <p className="text-blue-100/60 font-medium text-sm mt-1">Current leading performance benchmark.</p>
            </div>
            <div className="mt-8 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center font-black text-2xl border border-white/10">
                    {filteredReports[0]?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tight">{filteredReports[0]?.name || 'Calculating...'}</h4>
                    <p className="text-blue-100/60 text-xs font-bold uppercase tracking-widest">Revenue Alpha</p>
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-6">
                  <div>
                    <p className="text-[9px] font-black text-blue-100/50 uppercase tracking-widest">Yield</p>
                    <p className="text-2xl font-black">₹{(filteredReports[0]?.premium || 0).toLocaleString()}</p>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div>
                    <p className="text-[9px] font-black text-blue-100/50 uppercase tracking-widest">Conversions</p>
                    <p className="text-2xl font-black">{filteredReports[0]?.conversions || 0}</p>
                  </div>
               </div>
            </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="card !p-0 border-none shadow-sm overflow-hidden">
        <div className="p-5 sm:p-8 border-b border-[var(--border-light)]">
          <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-light)] rounded-2xl px-4 sm:px-5 py-3 w-full sm:w-96 group focus-within:border-primary transition-all">
            <Search size={18} className="text-[var(--text-muted)] group-focus-within:text-primary flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search employee or team..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-[var(--text-main)] font-semibold" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead className="bg-[var(--bg-main)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] border-b border-[var(--border-light)]">
              <tr>
                <th className="px-5 sm:px-8 py-5">Rank</th>
                <th className="px-5 sm:px-8 py-5">Profile</th>
                <th className="px-5 sm:px-8 py-5 text-center">Conv.</th>
                <th className="px-5 sm:px-8 py-5">Premium</th>
                <th className="px-5 sm:px-8 py-5">Incentives</th>
                <th className="px-5 sm:px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {loading ? (
                 [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse h-20 bg-[var(--bg-main)]/30">
                    <td colSpan="6" className="px-5"></td>
                  </tr>
                ))
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center text-[var(--text-muted)] font-black uppercase tracking-widest opacity-30">
                     No Data Streams Detected
                  </td>
                </tr>
              ) : filteredReports.map((report, i) => (
                <tr key={report._id} className="hover:bg-primary/5 transition-all group">
                  <td className="px-5 sm:px-8 py-4 sm:py-6">
                    <span className={`text-base sm:text-lg font-black ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </span>
                  </td>
                  <td className="px-5 sm:px-8 py-4 sm:py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)] flex items-center justify-center font-black text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                        {report.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-[var(--text-main)] text-sm tracking-tight whitespace-nowrap">{report.name}</p>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{report.branch}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 sm:px-8 py-4 sm:py-6 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-100 whitespace-nowrap">
                      {report.conversions}
                    </span>
                  </td>
                  <td className="px-5 sm:px-8 py-4 sm:py-6 font-black text-[var(--text-main)] tabular-nums tracking-tighter whitespace-nowrap">
                    ₹{report.premium.toLocaleString()}
                  </td>
                  <td className="px-5 sm:px-8 py-4 sm:py-6 font-black text-primary tabular-nums tracking-tighter whitespace-nowrap">
                    ₹{report.incentives.toLocaleString()}
                  </td>
                  <td className="px-5 sm:px-8 py-4 sm:py-6 text-right">
                    <div className="flex items-center justify-end gap-1 text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest">
                       <Activity size={12} className="text-green-500" />
                       <span className="hidden sm:inline">Active</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReports;
