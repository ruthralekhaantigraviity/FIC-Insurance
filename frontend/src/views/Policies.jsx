import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Search, Filter, 
  FileText, Calendar, TrendingUp,
  Download, Activity, CheckCircle,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/payments/policies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolicies(res.data);
    } catch (err) {
      console.error('Failed to fetch policies', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.policyNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || p.insuranceType === typeFilter;
    return matchesSearch && matchesType;
  });

  const totals = {
    total: policies.length,
    od: policies.filter(p => p.insuranceType === 'od').length,
    tp: policies.filter(p => p.insuranceType === 'third_party').length,
    premium: policies.reduce((sum, p) => sum + (p.premium || 0), 0)
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[var(--bg-card)] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">Policy Repository</h2>
          <p className="text-[var(--text-muted)] font-medium mt-1 text-sm">
            Centralized hub for all issued certificates, renewals, and risk coverage tracking.
          </p>
        </div>
        <div className="flex items-center gap-3 xl:justify-end">
          <button 
            onClick={() => window.open('/api/reports/export/policies', '_blank')}
            className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-105 transition-all"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { label: 'Total Premium', value: `₹${totals.premium.toLocaleString()}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'OD Policies', value: totals.od, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'TP Policies', value: totals.tp, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Active Pipeline', value: totals.total, icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((s, i) => (
          <div key={i} className="card !p-6 flex items-center gap-5 border-none shadow-sm">
            <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
              <s.icon size={26} />
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
          <div className="flex items-center bg-[var(--bg-main)] border border-[var(--border-light)] rounded-2xl px-4 sm:px-5 py-2.5 w-full sm:w-96 group focus-within:border-primary transition-all">
            <Search size={18} className="text-[var(--text-muted)] group-focus-within:text-primary flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search Policy No or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm ml-3 w-full text-[var(--text-main)] font-medium" 
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['all', 'od', 'third_party'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  typeFilter === t 
                  ? 'bg-primary text-white shadow-lg' 
                  : 'bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-light)] hover:bg-[var(--bg-card)]'
                }`}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--bg-main)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] border-b border-[var(--border-light)]">
              <tr>
                <th className="px-8 py-6">Policy Number</th>
                <th className="px-8 py-6">Customer</th>
                <th className="px-8 py-6">Classification</th>
                <th className="px-8 py-6">Premium (INR)</th>
                <th className="px-8 py-6">Issuance</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)] bg-white dark:bg-transparent">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse h-20 bg-[var(--bg-main)]/30">
                    <td colSpan="6" className="px-8"></td>
                  </tr>
                ))
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto opacity-40">
                      <ShieldCheck size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-sm font-black uppercase tracking-widest text-gray-500">Zero Policies Found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPolicies.map((policy) => (
                <tr key={policy._id} className="hover:bg-primary/5 transition-all group">
                  <td className="px-8 py-6 font-black text-primary tracking-tight">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Hash size={12} />
                      </div>
                      {policy.policyNumber}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-main)] text-sm">{policy.lead?.name || 'Manual Entry'}</span>
                      <span className="text-[10px] font-medium text-[var(--text-muted)] lowercase">{policy.lead?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                      policy.insuranceType === 'od' 
                      ? 'bg-blue-50 border-blue-100 text-blue-700' 
                      : 'bg-purple-50 border-purple-100 text-purple-700'
                    }`}>
                      {policy.insuranceType === 'od' ? 'Own Damage' : 'Third Party'}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-[var(--text-main)] text-base tabular-nums">
                    ₹{policy.premium?.toLocaleString() || '0'}
                  </td>
                  <td className="px-8 py-6 text-[11px] font-bold text-[var(--text-muted)] tabular-nums uppercase">
                    {new Date(policy.issuedAt || policy.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                      <CheckCircle size={10} /> {policy.status}
                    </span>
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

export default Policies;
