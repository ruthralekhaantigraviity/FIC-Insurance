import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, Search, Calendar, 
  ArrowRight, Download, Filter, 
  CheckCircle, Clock, AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(pay => {
    const matchesFilter = filter === 'all' || pay.status === filter;
    const matchesSearch = pay.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pay.method?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalVolume: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 bg-[var(--bg-card)] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">Payment Tracking</h2>
          <p className="text-[var(--text-muted)] font-medium mt-1 text-sm">
            Monitor transaction status, payment links, and premium collection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary">
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Volume', value: `₹${stats.totalVolume.toLocaleString()}`, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Awaiting', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Count', value: stats.total, icon: ArrowRight, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((s, i) => (
          <div key={i} className="card !p-6 flex items-center gap-5 border-none shadow-sm">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{s.label}</p>
              <h4 className="text-xl font-black text-[var(--text-main)]">{s.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="card !p-0 border-none shadow-sm overflow-hidden">
        <div className="p-5 sm:p-8 border-b border-[var(--border-light)] flex flex-col gap-4">
          <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-light)] rounded-2xl px-4 py-2 w-full sm:w-96 group focus-within:border-primary transition-all">
            <Search size={18} className="text-[var(--text-muted)] group-focus-within:text-primary flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search leads or method..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-[var(--text-main)]" 
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'completed', 'pending'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === s 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-light)] hover:bg-[var(--bg-card)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-main)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Lead Identity</th>
                <th className="px-8 py-5">Amount (INR)</th>
                <th className="px-8 py-5">Method</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5 text-right">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-8 py-6 h-16 bg-[var(--bg-main)]/50"></td>
                  </tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-12 text-center text-[var(--text-muted)] font-medium">
                    No payment records found.
                  </td>
                </tr>
              ) : filteredPayments.map((pay) => (
                <tr key={pay._id} className="hover:bg-primary/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {pay.lead?.name?.charAt(0) || 'L'}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-main)]">{pay.lead?.name || 'Unknown Lead'}</p>
                        <p className="text-[10px] font-medium text-[var(--text-muted)]">{pay.lead?.phone || 'No phone'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-[var(--text-main)] tabular-nums">
                    ₹{pay.amount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-3 py-1 bg-[var(--bg-main)] rounded-lg border border-[var(--border-light)]">
                      {pay.method?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${pay.status === 'completed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${pay.status === 'completed' ? 'text-green-600' : 'text-amber-600'}`}>
                         {pay.status}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-[var(--text-muted)] tabular-nums">
                    {new Date(pay.paidAt || pay.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {pay.link && (
                      <a 
                        href={pay.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-primary hover:bg-primary/10 transition-all inline-flex"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
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

export default Payments;
