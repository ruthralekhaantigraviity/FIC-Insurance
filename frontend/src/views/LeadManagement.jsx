import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  Upload, UserPlus, Filter, Search, 
  MoreHorizontal, Download, CheckCircle, Clock,
  Car, Briefcase, TrendingUp, AlertCircle,
  Heart, Shield, Zap, Activity, ChevronRight, X, ArrowLeft,
  CreditCard, PhoneCall, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const LeadManagement = () => {
  const { user } = useContext(AuthContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningLoading, setAssigningLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', insuranceType: '', note: '', premium: '' });
  const [newNote, setNewNote] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState(null);
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [callLogData, setCallLogData] = useState({ status: 'interested', isPaid: false, notes: '' });

  useEffect(() => {
    console.log('LeadManagement Terminal Initialized');
    fetchLeads();
    if (user?.role !== 'employee') fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users/team');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch team members');
    }
  };

  const handleBulkAssign = async (employeeId) => {
    setAssigningLoading(true);
    try {
      await api.put('/leads/assign', {
        leadIds: selectedLeads,
        employeeId
      });
      fetchLeads();
      setSelectedLeads([]);
      setShowAssignModal(false);
      toast.success(`Successfully assigned to ${employees.find(e => e._id === employeeId)?.name}`);
    } catch (err) {
      toast.error('Bulk assignment failed');
    } finally {
      setAssigningLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) return;
    try {
      await api.delete('/leads/bulk', {
        data: { leadIds: selectedLeads }
      });
      fetchLeads();
      setSelectedLeads([]);
      toast.success(`Deleted ${selectedLeads.length} leads successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    }
  };

  const handleDeleteLead = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
      toast.success('Lead deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(l => l._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleCallInitiated = (lead) => {
    setSelectedLead(lead);
    setShowCallLogModal(true);
    if (lead.status === 'new') {
      api.put(`/leads/${lead._id}/status`, { status: 'called', note: 'Call initiated via terminal dialer' })
         .then(() => fetchLeads());
    }
  };

  const submitCallLog = async () => {
    try {
      await api.post('/calls', {
        ...callLogData,
        leadId: selectedLead?._id
      });
      toast.success('Call transmission recorded');
      setShowCallLogModal(false);
      setCallLogData({ status: 'interested', isPaid: false, notes: '' });
    } catch (err) {
      toast.error('Failed to log call stats');
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (statusUpdate.status === 'issued') {
        await api.post('/payments/policy', {
          leadId: selectedLead._id,
          insuranceType: statusUpdate.insuranceType || 'od',
          premium: parseFloat(statusUpdate.premium) || 10000,
          policyExpiryDate: statusUpdate.policyExpiryDate,
          paymentId: selectedLead._id 
        });
      } else {
        await api.put(`/leads/${selectedLead._id}/status`, statusUpdate);
      }
      fetchLeads();
      setShowWorkspace(false);
      setStatusUpdate({ status: '', insuranceType: '', note: '', premium: '' });
      toast.success('Lead transformation successful');
    } catch (err) {
      toast.error('Failed to update lead status');
    } finally {
      setIsUpdating(false);
    }
  };

  const addNoteOnly = async () => {
    if (!newNote.trim()) return;
    try {
      await api.put(`/leads/${selectedLead._id}/status`, { 
        status: selectedLead.status, 
        note: newNote 
      });
      fetchLeads();
      setNewNote('');
      toast.info('Note synchronized');
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    const importPromise = axios.post('/api/leads/import', formData, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    toast.promise(
      importPromise,
      {
        pending: 'Injecting dataset into terminal...',
        success: {
          render({data}) {
            fetchLeads();
            setShowImportModal(false);
            setFile(null);
            return data.data.message || 'Dataset synchronized successfully';
          }
        },
        error: {
          render({data}) {
            return data.response?.data?.message || 'Injection failed. Check file schema.';
          }
        }
      }
    );
  };

  const statusMap = {
    'new': { label: 'New Lead', color: 'bg-blue-600', icon: TrendingUp },
    'interested': { label: 'Interested', color: 'bg-pink-500', icon: Heart },
    'payment_link_sent': { label: 'Link Sent', color: 'bg-amber-500', icon: Clock },
    'issued': { label: 'Policy Issued', color: 'bg-green-500', icon: CheckCircle },
    'cancelled': { label: 'Cancelled', color: 'bg-red-500', icon: X },
  };

  const categoryMap = {
    'motor': { label: 'Motor', color: 'text-blue-600', bg: 'bg-blue-50', icon: Car },
    'health': { label: 'Health', color: 'text-green-600', bg: 'bg-green-50', icon: Activity },
    'life': { label: 'Life', color: 'text-purple-600', bg: 'bg-purple-50', icon: Shield },
    'property': { label: 'Property', color: 'text-orange-600', bg: 'bg-orange-50', icon: Briefcase },
  };

  const handleGeneratePaymentLink = async () => {
    try {
      const res = await axios.post('/api/payments/link', {
        leadId: selectedLead._id,
        amount: 15000 // Mock amount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Secure Payment Link Generated');
      // Copy to clipboard or show in a better way
      navigator.clipboard.writeText(res.data.link);
      toast.info('Link copied to clipboard');
      fetchLeads();
      setShowWorkspace(false);
    } catch (err) {
      toast.error('Failed to generate payment link');
    }
  };

  const handleWhatsApp = (type) => {
    const phone = selectedLead.phone?.replace(/\D/g, '');
    let text = '';
    if (type === 'payment') {
       text = `Hello ${selectedLead.name}, here is your payment link for FIC Elite Insurance: [LINK]`;
    } else if (type === 'renewal') {
       text = `Hello ${selectedLead.name}, your policy is due for renewal soon. Please contact us to stay protected.`;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-10 pb-12 relative min-h-[600px]">
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {(selectedLeads.length > 0) && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-gray-900/90 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-xl"
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Batch Selected</span>
              <span className="text-xl font-black italic">{selectedLeads.length} Risk Profiles</span>
            </div>
            <div className="h-10 w-px bg-white/10"></div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAssignModal(true)}
                className="px-6 py-3 bg-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
              >
                <UserPlus size={16} />
                Assign Subordinates
              </button>
              {(user?.role === 'admin' || user?.role === 'team_leader') && (
                <button 
                  onClick={handleBulkDelete}
                  className="px-6 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 hover:bg-red-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete Assets
                </button>
              )}
              <button 
                onClick={() => setSelectedLeads([])}
                className="p-3 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-[var(--bg-card)] p-8 rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black text-[var(--text-main)]">Lead Management</h2>
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Active Risk Injections: <span className="text-primary">{leads.length}</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-6 xl:justify-end relative z-10">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="w-72 pl-14 pr-6 py-3.5 bg-[var(--bg-main)] border border-[var(--border-light)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm text-[var(--text-main)]"
            />
          </div>
          <button className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 text-gray-600 transition-all active:scale-95">
            <Filter size={22} />
          </button>
          <div className="h-10 w-px bg-gray-100 mx-2"></div>
          <button 
            onClick={() => window.open('/api/reports/export/leads', '_blank')}
            className="flex items-center gap-3 px-6 py-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:scale-105 transition-all"
            >
              <Upload size={18} />
              Inject Dataset
            </button>
          )}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden relative border-none shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--bg-main)] border-b border-[var(--border-light)]">
                <th className="px-10 py-5 w-10">
                   <button onClick={toggleSelectAll} className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${leads.length > 0 && selectedLeads.length === leads.length ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                      {leads.length > 0 && selectedLeads.length === leads.length && <CheckCircle size={12} />}
                   </button>
                </th>
                <th className="px-10 py-5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Lead Identity</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Category</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Assigned To</th>
                <th className="px-10 py-5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)] bg-[var(--bg-card)]">
              <AnimatePresence>
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse h-24">
                      <td colSpan="6" className="px-10 py-4"><div className="h-14 bg-gray-100/50 rounded-2xl w-full"></div></td>
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr key="empty">
                    <td colSpan="6" className="px-10 py-32 text-center">
                      <div className="max-w-xs mx-auto opacity-30">
                        <Zap size={64} className="mx-auto mb-6 text-gray-400" />
                        <p className="text-lg font-black uppercase tracking-[0.3em] text-gray-900">Zero Entries</p>
                        <p className="text-sm font-medium text-gray-500 mt-4 leading-relaxed">The engagement terminal is awaiting dataset injection.</p>
                      </div>
                    </td>
                  </tr>
                ) : leads.map((lead, i) => {
                  const category = categoryMap[lead.insuranceType] || categoryMap['motor'];
                  const status = statusMap[lead.status] || statusMap['new'];
                  const confidence = 65 + ((lead.name || '').length * 3) % 30;
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={lead._id || i} 
                      className={`hover:bg-blue-50/40 transition-all group ${selectedLeads.includes(lead._id) ? 'bg-blue-50/60' : ''}`}
                    >
                      <td className="px-10 py-6">
                         <button onClick={() => toggleSelectOne(lead._id)} className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedLeads.includes(lead._id) ? 'bg-primary border-primary text-white' : 'border-gray-200 group-hover:border-primary/50'}`}>
                            {selectedLeads.includes(lead._id) && <CheckCircle size={12} />}
                         </button>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-[var(--bg-main)] flex items-center justify-center font-bold text-[var(--text-muted)] border border-[var(--border-light)] shadow-sm">
                            {(lead.name || 'L').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-main)] mb-1">{lead.name || 'Unnamed Lead'}</p>
                            <a href={`tel:${lead.phone}`} onClick={() => handleCallInitiated(lead)} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4 flex items-center gap-1">
                               <PhoneCall size={10} />
                               {lead.phone || 'No Phone'}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-main)]">{status.label}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border ${category.bg} ${category.color} ${category.color.replace('text-', 'border-')}/20 shadow-sm`}>
                          <category.icon size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{category.label}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] border border-[var(--border-light)]">
                            {lead.assignedTo?.name?.charAt(0) || <Activity size={12} />}
                          </div>
                          <span className="text-xs font-bold text-[var(--text-main)]">{lead.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex flex-col gap-2 w-24">
                          <div className="flex items-center justify-between text-[8px] font-black text-gray-400 uppercase tracking-widest">
                             <span>Closure</span>
                             <span className={confidence > 80 ? 'text-green-500' : 'text-gray-500'}>{confidence}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${confidence}%` }}
                               transition={{ delay: 0.5, duration: 1 }}
                               className={`h-full ${confidence > 80 ? 'bg-green-500' : 'bg-primary'}`}
                             />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(user?.role === 'admin' || user?.role === 'team_leader') && (
                            <button 
                              onClick={(e) => handleDeleteLead(lead._id, e)}
                              className="h-11 w-11 rounded-2xl hover:bg-red-50 hover:shadow-xl border border-transparent hover:border-red-100 transition-all flex items-center justify-center text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedLead(lead);
                              setStatusUpdate({ status: lead.status, insuranceType: lead.insuranceType, note: '', premium: '' });
                              setShowWorkspace(true);
                            }}
                            className="h-11 w-11 rounded-2xl hover:bg-white hover:shadow-xl border border-transparent hover:border-gray-50 transition-all flex items-center justify-center text-gray-400 hover:text-primary group-hover:scale-110"
                          >
                            <ChevronRight size={22} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showWorkspace && selectedLead && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center p-0 sm:p-6 bg-gray-900/60 backdrop-blur-xl">
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-8 sm:p-12 bg-gray-900 text-white flex flex-col sm:flex-row items-center justify-between gap-8 relative overflow-hidden">
                 <div className="flex items-center gap-8 relative z-10">
                    <button onClick={() => setShowWorkspace(false)} className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                      <ArrowLeft size={24} />
                    </button>
                    <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center font-black text-3xl shadow-2xl shadow-blue-900/40 border border-blue-400/20">
                      {selectedLead?.name?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <h3 className="text-3xl font-black tracking-tighter italic mb-2 leading-none">{selectedLead?.name || 'Lead Details'}</h3>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest border border-white/5 font-mono">ID: {selectedLead._id?.slice(-8).toUpperCase()}</span>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusMap[selectedLead.status]?.color || 'bg-gray-500'} text-white shadow-lg shadow-black/20`}>
                          {statusMap[selectedLead.status]?.label || selectedLead.status}
                        </span>
                      </div>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] -mr-20 -mt-20"></div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gray-50/50">
                <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-12">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <Activity size={14} className="text-primary" />
                        Operational Transformation
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.keys(statusMap).map(statusKey => (
                          <button
                            key={statusKey}
                            onClick={() => setStatusUpdate({...statusUpdate, status: statusKey})}
                            className={`p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                              statusUpdate.status === statusKey 
                              ? 'bg-gray-900 text-white border-transparent shadow-xl' 
                              : 'bg-white text-gray-400 border-gray-100 hover:border-primary/20'
                            }`}
                          >
                            {statusMap[statusKey].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contextual Insurance Type</label>
                        <div className="flex gap-4">
                          {['od', 'third_party'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setStatusUpdate({...statusUpdate, insuranceType: type})}
                              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                statusUpdate.insuranceType === type 
                                ? 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-900/20' 
                                : 'bg-white text-gray-400 border-gray-100'
                              }`}
                            >
                              {type === 'od' ? 'Own Damage' : 'Third Party'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Terminal Note injection</label>
                        <input 
                          type="text"
                          placeholder="Describe the engagement state..."
                          value={statusUpdate.note}
                          onChange={(e) => setStatusUpdate({...statusUpdate, note: e.target.value})}
                          className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-primary/10 transition-all font-bold text-sm"
                        />
                      </div>
                    </div>

                    {statusUpdate.status === 'issued' && (
                      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Policy Premium (INR)</label>
                          <input 
                            type="number"
                            placeholder="e.g. 15000"
                            value={statusUpdate.premium}
                            onChange={(e) => setStatusUpdate({...statusUpdate, premium: e.target.value})}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-green-500/10 border-green-500/20 text-green-600 font-black text-lg transition-all"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Policy Expiry DATE</label>
                          <input 
                            type="date"
                            value={statusUpdate.policyExpiryDate || ''}
                            onChange={(e) => setStatusUpdate({...statusUpdate, policyExpiryDate: e.target.value})}
                            className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-inner outline-none focus:ring-2 focus:ring-blue-500/10 border-blue-500/20 text-blue-600 font-bold transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setShowWorkspace(false)}
                        className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all font-mono"
                      >
                        Cancel / Terminate
                      </button>
                      <button 
                        onClick={handleStatusUpdate}
                        disabled={isUpdating}
                        className="flex-[2] py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                        {isUpdating ? <Activity className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                        Confirm Transformation
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-200/50">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Channel Transmission</h4>
                    <div className="flex flex-wrap gap-4">
                       <button 
                          onClick={() => handleWhatsApp(selectedLead.status === 'issued' ? 'renewal' : 'payment')}
                          className="flex-1 min-w-[140px] p-5 rounded-3xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 flex flex-col items-center gap-3 hover:bg-[#25D366] hover:text-white transition-all group"
                       >
                          <Activity size={24} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                       </button>
                       <button 
                          onClick={handleGeneratePaymentLink}
                          className="flex-1 min-w-[140px] p-5 rounded-3xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex flex-col items-center gap-3 hover:bg-blue-500 hover:text-white transition-all group"
                       >
                          <CreditCard size={24} className="group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Payment Link</span>
                       </button>
                       <button className="flex-1 min-w-[140px] p-5 rounded-3xl bg-gray-900 text-white flex flex-col items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-black/20">
                          <Activity size={24} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Voice Link</span>
                       </button>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-[400px] border-l border-gray-200/50 bg-white/50 backdrop-blur-md overflow-y-auto p-10 flex flex-col">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Chronological Log</h4>
                  <div className="flex-1 space-y-8">
                     {(selectedLead.history || []).length > 0 ? (
                        selectedLead.history.map((item, idx) => (
                           <div key={idx} className="relative pl-8 border-l-2 border-gray-100 last:border-transparent pb-4">
                              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-200"></div>
                              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">{item.status}</p>
                              <p className="text-xs font-bold text-gray-500 mb-2 leading-relaxed">{item.note || 'Terminal update recorded.'}</p>
                              <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter">
                                 {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                        ))
                     ) : (
                        <div className="text-center py-20 opacity-20">
                           <Activity size={40} className="mx-auto mb-4" />
                           <p className="text-[10px] font-black uppercase tracking-widest">No Logs Detected</p>
                        </div>
                     )}
                  </div>
                  <div className="mt-10 pt-10 border-t border-gray-100">
                    <div className="relative">
                       <textarea 
                          rows="3"
                          placeholder="Inject operational note..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="w-full px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-inner text-sm font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
                       />
                       <button 
                          onClick={addNoteOnly}
                          className="absolute bottom-4 right-4 h-10 w-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                       >
                          <ChevronRight size={20} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="bg-primary p-12 text-white relative">
                <button onClick={() => setShowImportModal(false)} className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all z-10"><X size={20}/></button>
                <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none"><Upload size={140}/></div>
                <h3 className="text-4xl font-black tracking-tighter mb-4 italic leading-none">Dataset Terminal</h3>
                <p className="text-blue-100 font-medium text-lg leading-relaxed">Broadcast unified lead risk profiles into the operational terminal.</p>
              </div>
              <form onSubmit={handleImport} className="p-12 space-y-10">
                <div onClick={() => document.getElementById('csv-file').click()} className={`border-4 border-dashed rounded-[2.5rem] p-16 text-center transition-all cursor-pointer ${file ? 'border-green-500 bg-green-50 shadow-inner' : 'border-gray-100 bg-gray-50 hover:border-primary hover:bg-blue-50'}`}>
                  {!file ? (
                    <>
                      <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-8"><Upload size={36} className="text-gray-300"/></div>
                      <p className="text-2xl font-black text-gray-900 tracking-tight">Stage Dataset</p>
                      <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-[0.2em]">Validated Schema: All Files (.)</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-green-500 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-8 text-white scale-110"><CheckCircle size={40}/></div>
                      <p className="text-2xl font-black text-green-900 tracking-tight">{file.name}</p>
                      <p className="text-[10px] font-black text-green-600 mt-4 uppercase tracking-[0.2em]">Transmission Ready</p>
                    </>
                  )}
                  <input id="csv-file" type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                </div>
                <div className="flex gap-6">
                  <button type="button" onClick={() => setShowImportModal(false)} className="flex-1 py-5 bg-gray-100 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all border border-gray-100 font-mono">Cancel</button>
                  <button type="submit" disabled={!file} className="flex-[2] btn-primary py-5 disabled:grayscale shadow-2xl shadow-blue-900/40">Authorize Injection</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assignment Modal (Bulk) */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-gray-900 p-10 text-white relative">
                <button onClick={() => setShowAssignModal(false)} className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all z-10"><X size={20}/></button>
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                      <UserPlus size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black tracking-tighter italic">Redistribute Assets</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Broadcasting selection: {selectedLeads.length} items</p>
                   </div>
                </div>
              </div>
              <div className="p-10">
                <div className="space-y-4 max-h-[400px] overflow-y-auto mb-10 pr-2 custom-scrollbar">
                  {employees.map(emp => (
                    <button 
                      key={emp._id}
                      disabled={assigningLoading}
                      onClick={() => handleBulkAssign(emp._id)}
                      className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-gray-400 group-hover:text-primary transition-colors">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900">{emp.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{emp.role} • {emp.team || emp.branch}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                  {employees.length === 0 && (
                    <div className="py-20 text-center opacity-30">
                       <UserPlus size={48} className="mx-auto mb-4" />
                       <p className="text-xs font-black uppercase tracking-widest">No Subordinates Found</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowAssignModal(false)}
                  className="w-full py-5 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Terminate Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCallLogModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-primary p-8 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black italic">Record Call Interaction</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100 opacity-60">Logging telemetry for {selectedLead?.name}</p>
                </div>
                <button onClick={() => setShowCallLogModal(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20"><X size={18}/></button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Customer Sentiment</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'interested', label: 'Interested', icon: Heart },
                      { id: 'not_interested', label: 'Not Interested', icon: X },
                      { id: 'unreachable', label: 'Unreachable', icon: Clock }
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setCallLogData({...callLogData, status: s.id})}
                        className={`p-4 rounded-2xl flex items-center gap-3 border transition-all ${callLogData.status === s.id ? 'bg-gray-900 text-white border-transparent' : 'bg-white text-gray-400 border-gray-100'}`}
                      >
                        <s.icon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-xs font-black text-gray-900">Payment Secured?</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Did the customer commit to payment?</p>
                  </div>
                  <button 
                    onClick={() => setCallLogData({...callLogData, isPaid: !callLogData.isPaid})}
                    className={`w-14 h-8 rounded-full relative transition-all ${callLogData.isPaid ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${callLogData.isPaid ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Interaction Notes</label>
                  <textarea 
                    placeholder="Briefly describe the outcome..."
                    value={callLogData.notes}
                    onChange={(e) => setCallLogData({...callLogData, notes: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                    rows="3"
                  />
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowCallLogModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest">Discard</button>
                  <button onClick={submitCallLog} className="flex-[2] py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20">Inject Log</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeadManagement;
