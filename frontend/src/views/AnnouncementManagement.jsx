import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Megaphone, Plus, Calendar, Clock, Trash2, Shield, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const visibilityOptions = [
  { key: 'all',         label: 'All Staff'   },
  { key: 'employee',    label: 'Employees'   },
  { key: 'team_leader', label: 'Team Leaders'},
  { key: 'admin',       label: 'Admin'       },
];

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [formData, setFormData]           = useState({ title: '', message: '', visibleTo: ['all'] });

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('token');
      const res   = await axios.get('/api/announcements', { headers: { Authorization: `Bearer ${token}` } });
      setAnnouncements(res.data);
    } catch (err) { console.error('Failed to fetch announcements'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/announcements', formData, { headers: { Authorization: `Bearer ${token}` } });
      setShowModal(false);
      setFormData({ title: '', message: '', visibleTo: ['all'] });
      fetchAnnouncements();
    } catch (err) { alert('Failed to post announcement'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Terminate this transmission?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/announcements/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAnnouncements();
    } catch (err) { alert('Termination failed'); }
  };

  const toggleVisibility = (key) => {
    setFormData(prev => {
      const has = prev.visibleTo.includes(key);
      return { ...prev, visibleTo: has ? prev.visibleTo.filter(k => k !== key) : [...prev.visibleTo, key] };
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-card)] p-8 rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-main)]">Announcements</h2>
          <p className="text-[var(--text-muted)] font-medium mt-1">
            Broadcast updates and alerts to your team.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary group">
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
          <span>Post Update</span>
        </button>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="card h-28 animate-pulse bg-[var(--bg-main)] rounded-[2rem]"></div>
            ))
          ) : announcements.length === 0 ? (
            <div className="card text-center py-32 opacity-40 select-none">
              <Megaphone size={56} className="mx-auto mb-4 text-[var(--text-muted)]" />
              <p className="text-lg font-black text-[var(--text-main)] uppercase tracking-widest">No Announcements</p>
              <p className="text-sm font-medium text-[var(--text-muted)] mt-2">Post an update to notify your team.</p>
            </div>
          ) : announcements.map((ann, i) => (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              key={ann._id}
              className="card card-hover group flex items-start justify-between gap-6"
            >
              {/* Icon */}
              <div className="bg-primary/10 p-4 rounded-2xl text-primary flex-shrink-0 mt-0.5">
                <Megaphone size={22} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-black text-lg text-[var(--text-main)] tracking-tight">{ann.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                    ann.visibleTo?.includes('employee')
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {Array.isArray(ann.visibleTo) ? ann.visibleTo.join(', ') : ann.visibleTo}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-3xl">{ann.message}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    <Calendar size={11} />
                    {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    <Clock size={11} />
                    {new Date(ann.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button 
                onClick={() => handleDelete(ann._id)}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 border border-[var(--border-light)] transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Announcement Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--bg-card)] rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-[var(--border-light)]"
            >
              {/* Modal Header */}
              <div className="bg-primary p-8 text-white flex items-start justify-between relative overflow-hidden">
                <div>
                  <h3 className="text-2xl font-black mb-1">Post Announcement</h3>
                  <p className="text-blue-200 text-sm font-medium">Broadcast a message to your selected audience.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                  <X size={18} />
                </button>
                <div className="absolute right-6 bottom-0 opacity-10"><Megaphone size={90} /></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Q2 Target Achievement Milestone"
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Message</label>
                  <textarea
                    required
                    rows="4"
                    className="input-field resize-none"
                    placeholder="Write your announcement here..."
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Visible To</label>
                  <div className="grid grid-cols-2 gap-3">
                    {visibilityOptions.map(opt => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleVisibility(opt.key)}
                        className={`py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          formData.visibleTo.includes(opt.key)
                            ? 'bg-primary text-white border-transparent shadow-lg'
                            : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-primary hover:text-primary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-[var(--bg-main)] text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-[var(--border-light)] transition-all border border-[var(--border-light)]"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary group">
                    <Send size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    Publish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementManagement;
