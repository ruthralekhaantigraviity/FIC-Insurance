import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { TrendingUp, Shield, Briefcase, DollarSign, Clock, Download, ChevronRight, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Incentives = () => {
  const { user } = useContext(AuthContext);
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState([]);
  const [showConfig, setShowConfig] = useState(false);

  const slabs = [
    { id: 'od', type: 'Own Damage (OD)', desc: 'Percentage of Net Premium', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-600' },
    { id: 'third_party', type: 'Third Party (TP)', desc: 'Flat Policy Issuance', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-600' }
  ];

  const [profile, setProfile] = useState(null);

  const fetchIncentives = async () => {
    try {
      const token = localStorage.getItem('token');
      const [incentiveRes, settingsRes, profileRes] = await Promise.all([
        axios.get('/api/payments/incentives', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/payments/incentive-settings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setIncentives(incentiveRes.data);
      setSettings(settingsRes.data);
      setProfile(profileRes.data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncentives();
  }, []);

  const updateSetting = async (insuranceType, value, type) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/payments/incentive-settings', 
        { insuranceType, value: parseFloat(value), type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${insuranceType.toUpperCase()} settings updated`);
      fetchIncentives();
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-main)]">Incentive Settings</h2>
          <p className="text-[var(--text-muted)] font-medium mt-1">Operational commission structures and verified earnings reports.</p>
        </div>
        <div className="flex gap-4">
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all ${showConfig ? 'bg-primary text-white shadow-lg' : 'bg-[var(--bg-card)] border border-[var(--border-light)] text-[var(--text-muted)] hover:bg-[var(--bg-main)] hover:text-[var(--text-main)]'}`}
            >
              <Zap size={16} />
              Configuration
            </button>
          )}
          <button className="btn-primary">
            <Download size={16} />
            Export Ledger
          </button>
        </div>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card !p-8 bg-slate-900 border-none text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <CheckCircle size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Active Wallet</span>
            </div>
            <h4 className="text-4xl font-black tracking-tighter">₹{(profile?.incentivesWallet?.awarded || 0).toLocaleString()}</h4>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Released & Available for Payout</p>
          </div>
        </div>
        <div className="card !p-8 bg-[var(--bg-card)] border border-[var(--border-light)] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Clock size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Escrow Balance</span>
            </div>
            <h4 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">₹{(profile?.incentivesWallet?.pending || 0).toLocaleString()}</h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-2 uppercase tracking-widest">Pending Verification Audit</p>
          </div>
        </div>
        <div className="card !p-8 bg-[var(--bg-card)] border border-[var(--border-light)] relative overflow-hidden group">
           <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Lifetime Velocity</span>
            </div>
            <h4 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">₹{((profile?.incentivesWallet?.awarded || 0) + (profile?.incentivesWallet?.pending || 0)).toLocaleString()}</h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-2 uppercase tracking-widest">Total Earnings Generated</p>
          </div>
        </div>
      </div>

      {showConfig && user?.role === 'admin' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-primary/5 p-8 rounded-[2rem] border border-primary/10"
        >
          {slabs.map((slab) => {
            const current = settings.find(s => s.insuranceType === slab.id) || { value: 0, type: 'flat' };
            return (
              <div key={slab.id} className="bg-[var(--bg-card)] p-8 rounded-3xl shadow-sm border border-[var(--border-light)]">
                <div className="flex items-center gap-3 mb-6">
                  <slab.icon className={slab.color} size={20} />
                  <h4 className="font-bold text-[var(--text-main)] uppercase text-sm tracking-tight">{slab.type} Payout</h4>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => updateSetting(slab.id, current.value, 'flat')}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${current.type === 'flat' ? 'bg-primary text-white border-transparent' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-light)]'}`}
                    >
                      Flat Rate
                    </button>
                    <button 
                      onClick={() => updateSetting(slab.id, current.value, 'percentage')}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${current.type === 'percentage' ? 'bg-primary text-white border-transparent' : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-light)]'}`}
                    >
                      Percentage
                    </button>
                  </div>
                  <div className="relative">
                    <input 
                      type="number"
                      defaultValue={current.value}
                      onBlur={(e) => updateSetting(slab.id, e.target.value, current.type)}
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">
                      {current.type === 'percentage' ? '%' : 'INR'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {slabs.map((slab, i) => {
          const setting = settings.find(s => s.insuranceType === slab.id) || { value: 0, type: 'flat' };
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="card card-hover relative overflow-hidden active:scale-[0.98] transition-all"
            >
              <div className={`absolute top-0 right-0 w-40 h-40 ${slab.bg} opacity-[0.03] blur-3xl`}></div>
              <div className="flex items-center space-x-6 relative z-10">
                <div className={`p-5 rounded-[1.5rem] bg-[var(--bg-main)] border border-[var(--border-light)] ${slab.color}`}>
                  <slab.icon size={32} />
                </div>
                <div>
                  <h3 className="font-black text-2xl text-[var(--text-main)] tracking-tight italic">{slab.type}</h3>
                  <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">{slab.desc}</p>
                </div>
              </div>
              <div className="mt-12 flex items-end justify-between relative z-10">
                <div className="flex items-baseline space-x-3">
                  <span className={`text-6xl font-black ${slab.color} tracking-tighter`}>
                    {setting.type === 'percentage' ? '' : '₹'}
                    {setting.value}
                    {setting.type === 'percentage' ? '%' : ''}
                  </span>
                  <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-2">Commission</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 px-4 py-1.5 rounded-full border border-green-100 shadow-sm">
                    <TrendingUp size={12} /> Active Yield
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="card !p-0 overflow-hidden relative border-none shadow-xl shadow-black/5">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock size={16} />
              </div>
              Verification Logs
            </h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 ml-11">Chronological earnings statement</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">Client Signature</th>
                <th className="px-8 py-5">Chronology</th>
                <th className="px-8 py-5">Payout Amount</th>
                <th className="px-8 py-5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3].map(i => <tr key={i} className="animate-pulse h-20 bg-gray-50/20"></tr>)
              ) : incentives.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="max-w-xs mx-auto opacity-30">
                      <Zap size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Zero Earnings Detected</p>
                    </div>
                  </td>
                </tr>
              ) : incentives.map((inc, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${inc.insuranceType === 'od' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {inc.insuranceType === 'od' ? <Shield size={16} /> : <Briefcase size={16} />}
                      </div>
                      <span className="font-black text-gray-900 text-sm uppercase tracking-tight">{inc.insuranceType === 'od' ? 'Own Damage' : 'Third Party'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 text-sm">{inc.lead?.name || 'N/A'}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Case Reference Verified</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-500 tabular-nums">
                    {new Date(inc.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xl font-black text-[var(--primary)] tracking-tighter">₹{inc.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                      <CheckCircle size={10} /> Released
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

export default Incentives;
