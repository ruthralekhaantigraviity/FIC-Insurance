import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Target, Users, Briefcase, Phone, 
  RefreshCw, TrendingUp, Search, Lock,
  Unlock, CheckCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const TargetManagement = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [targets, setTargets] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [branchFilter, setBranchFilter] = useState('All');
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedMonth, branchFilter]);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/users/branches');
      setBranches(res.data);
    } catch (err) {
      console.error('Failed to fetch branches');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch employees
      let empRes = await api.get('/users/team');
      let emps = empRes.data;
      if (branchFilter !== 'All') {
        emps = emps.filter(e => e.branch === branchFilter);
      }
      setEmployees(emps);

      // Fetch targets for the month
      const targetRes = await api.get(`/targets/analytics/${selectedMonth}`);
      const targetsData = {};
      targetRes.data.forEach(t => {
        targetsData[t.user._id || t.user] = t;
      });
      setTargets(targetsData);
    } catch (err) {
      toast.error('Failed to fetch target data');
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (empId, field, value) => {
    setTargets(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value,
        isDirty: true
      }
    }));
  };

  const saveTarget = async (empId) => {
    const target = targets[empId];
    if (!target) return;

    try {
      await api.post('/targets', {
        user: empId,
        month: selectedMonth,
        premiumTarget: target.premiumTarget || 0,
        policyCountTarget: target.policyCountTarget || 0,
        dailyCallTarget: target.dailyCallTarget || 50,
        followUpTarget: target.followUpTarget || 0,
        renewalTarget: target.renewalTarget || 0
      });
      toast.success('Target assigned successfully!');
      
      // Update state to remove dirty flag
      setTargets(prev => ({
        ...prev,
        [empId]: {
          ...prev[empId],
          isDirty: false
        }
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign target');
    }
  };

  const lockMonthReports = async () => {
    if (!window.confirm(`Are you sure you want to lock reports for ${selectedMonth}? This cannot be undone.`)) return;
    try {
      await api.post('/targets/lock', { month: selectedMonth });
      toast.success(`Reports for ${selectedMonth} locked successfully`);
      fetchData(); // Refresh data
    } catch (err) {
      toast.error('Failed to lock reports');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-card)] p-8 rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-main)] flex items-center gap-3">
            <Target className="text-primary" size={28} />
            Target Management
          </h2>
          <p className="text-[var(--text-muted)] font-medium mt-1">
            Assign and monitor monthly performance goals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {user?.role === 'admin' && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="input-field max-w-[200px]"
            >
              <option value="All">All Branches</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-field max-w-[200px]"
          />
          {user?.role === 'admin' && (
            <button 
              onClick={lockMonthReports}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-colors border border-red-200"
            >
              <Lock size={16} />
              Lock Month
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-[var(--bg-card)] rounded-[2rem] border border-[var(--border-light)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Premium (₹)</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Policies</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Calls</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Follow-ups</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Renewals</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400 font-bold">Loading...</td>
                </tr>
              ) : employees.map((emp) => {
                const target = targets[emp._id] || {};
                const isLocked = target.locked;

                return (
                  <tr key={emp._id} className="hover:bg-blue-50/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0">
                          {emp.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{emp.name}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{emp.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={target.premiumTarget || ''}
                        onChange={(e) => handleTargetChange(emp._id, 'premiumTarget', Number(e.target.value))}
                        disabled={isLocked}
                        className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-primary disabled:opacity-50"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={target.policyCountTarget || ''}
                        onChange={(e) => handleTargetChange(emp._id, 'policyCountTarget', Number(e.target.value))}
                        disabled={isLocked}
                        className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-primary disabled:opacity-50"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={target.dailyCallTarget || ''}
                        onChange={(e) => handleTargetChange(emp._id, 'dailyCallTarget', Number(e.target.value))}
                        disabled={isLocked}
                        className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-primary disabled:opacity-50"
                        placeholder="50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={target.followUpTarget || ''}
                        onChange={(e) => handleTargetChange(emp._id, 'followUpTarget', Number(e.target.value))}
                        disabled={isLocked}
                        className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-primary disabled:opacity-50"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        value={target.renewalTarget || ''}
                        onChange={(e) => handleTargetChange(emp._id, 'renewalTarget', Number(e.target.value))}
                        disabled={isLocked}
                        className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:border-primary disabled:opacity-50"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isLocked ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                          <Lock size={12} /> Locked
                        </span>
                      ) : (
                        <button
                          onClick={() => saveTarget(emp._id)}
                          disabled={!target.isDirty}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center w-full gap-2
                            ${target.isDirty 
                              ? 'bg-primary text-white hover:bg-blue-700 shadow-blue-500/20' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
                        >
                          <CheckCircle size={14} />
                          Save
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TargetManagement;
