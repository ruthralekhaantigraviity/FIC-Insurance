import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  PhoneCall, Heart, X, CheckCircle, 
  Clock, AlertCircle, Send, Activity, 
  ChevronRight, Award, Banknote, Shield
} from 'lucide-react';
import { toast } from 'react-toastify';

const ActivityReporting = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    totalCalls: 0,
    interested: 0,
    notInterested: 0,
    paid: 0,
    nonPaid: 0,
    completed: 0,
    notPicking: 0,
    summary: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/reports/daily', {
        summary: formData.summary || 'Daily Call Report',
        statsSnapshot: formData
      });
      toast.success('Activity Log synchronized successfully');
    } catch (err) {
      toast.error('Failed to sync activity');
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { id: 'totalCalls',   label: 'Total Calls',   icon: PhoneCall,   color: 'text-blue-500',   bgColor: 'bg-blue-50' },
    { id: 'interested',   label: 'Interested',    icon: Heart,       color: 'text-pink-500',   bgColor: 'bg-pink-50' },
    { id: 'notInterested',label: 'Not Interested',icon: X,           color: 'text-red-500',    bgColor: 'bg-red-50' },
    { id: 'paid',         label: 'Paid',          icon: Banknote,    color: 'text-green-500',  bgColor: 'bg-green-50' },
    { id: 'nonPaid',      label: 'Non Paid',      icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { id: 'completed',    label: 'Completed',     icon: CheckCircle, color: 'text-emerald-500',bgColor: 'bg-emerald-50' },
    { id: 'notPicking',   label: 'Not Picking',   icon: Clock,       color: 'text-gray-500',   bgColor: 'bg-gray-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-card)] p-10 rounded-[3rem] border border-[var(--border-light)] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-[var(--text-main)] italic tracking-tighter">Activity Reporting Terminal</h2>
          <p className="text-[var(--text-muted)] font-medium mt-2">Log your daily call metrics and operational outcomes.</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="px-6 py-3 bg-primary/10 text-primary rounded-2xl font-black text-[10px] uppercase tracking-widest border border-primary/20">
            Live Stream Active
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-[var(--bg-card)] p-10 sm:p-14 rounded-[3rem] border border-[var(--border-light)] shadow-xl shadow-black/5">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-primary">
              <Activity size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight italic text-[var(--text-main)]">Daily Metric Injection</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Enter your operational tally for today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {inputFields.map((f) => (
              <div key={f.id} className="space-y-3">
                <div className="flex items-center gap-2 ml-1">
                  <f.icon size={14} className={f.color} />
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{f.label}</label>
                </div>
                <input 
                  type="number"
                  min="0"
                  value={formData[f.id]}
                  onChange={(e) => setFormData({...formData, [f.id]: parseInt(e.target.value) || 0})}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-light)] rounded-2xl p-4 text-lg font-black text-[var(--text-main)] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                  placeholder={`Enter ${f.label}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-12 pt-10 border-t border-[var(--border-light)] flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? <Activity className="animate-spin" size={18} /> : <Send size={18} />}
              Save Daily Activity
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-20 -mb-20"></div>
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-primary backdrop-blur-md border border-white/10">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight italic">Operational Summary</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inject contextual insights into the daily log</p>
              </div>
            </div>

            <textarea 
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
              placeholder="Describe your daily conversion trajectory, roadblocks or key wins..."
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 min-h-[160px] text-lg text-slate-200 outline-none focus:border-primary/50 transition-all placeholder:text-slate-600 font-medium"
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 hover:bg-blue-500 active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {loading ? (
                <Activity className="animate-spin" size={20} />
              ) : (
                <>
                  <Send size={20} />
                  Authorize & Submit Full Log
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ActivityReporting;
