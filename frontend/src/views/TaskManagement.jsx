import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  CheckCircle2, Clock, AlertTriangle, 
  Plus, Calendar, User, Zap,
  Timer, Shield, X, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskManagement = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users/team');
      setUsers(res.data);
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tasks', formData);
      setShowModal(false);
      fetchTasks();
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
      toast.success('Task successfully assigned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks();
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const priorityConfig = {
    'high':   { label: 'Urgent',   color: 'text-red-600',   bg: 'bg-red-50',   dot: 'bg-red-500'   },
    'medium': { label: 'Priority', color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
    'low':    { label: 'Routine',  color: 'text-blue-600',  bg: 'bg-blue-50',  dot: 'bg-blue-500'  },
  };

  const statusConfig = {
    'pending':     { label: 'Pending',     icon: Timer,        color: 'text-[var(--text-muted)]' },
    'in_progress': { label: 'In Progress', icon: Zap,          color: 'text-amber-500'           },
    'completed':   { label: 'Completed',   icon: CheckCircle2, color: 'text-green-500'            },
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 bg-[var(--bg-card)] p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">Task Management</h2>
          <p className="text-[var(--text-muted)] font-medium mt-1 text-sm">Assign and track operational tasks across your team.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'team_leader') && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary group w-fit"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
            <span>New Task</span>
          </button>
        )}
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence>
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="card h-56 animate-pulse bg-[var(--bg-main)] rounded-[2rem]"></div>
            ))
          ) : tasks.length === 0 ? (
            <div className="col-span-full py-32 text-center select-none opacity-40">
              <Zap size={56} className="mx-auto mb-4 text-[var(--text-muted)]" />
              <p className="text-lg font-black text-[var(--text-main)] uppercase tracking-widest">No Tasks Yet</p>
              <p className="text-sm font-medium text-[var(--text-muted)] mt-2">Create your first task to get started.</p>
            </div>
          ) : tasks.map((task, i) => {
            const priority = priorityConfig[task.priority] || priorityConfig['medium'];
            const status = statusConfig[task.status] || statusConfig['pending'];
            const StatusIcon = status.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                key={task._id}
                className="card card-hover flex flex-col justify-between"
              >
                {/* Top Row: Priority Badge + Due Date */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${priority.bg}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${priority.dot}`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${priority.color}`}>
                      {priority.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                    <Calendar size={12} />
                    {new Date(task.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </div>
                </div>

                {/* Task Title & Description */}
                <div className="flex-1">
                  <h3 className="font-black text-lg text-[var(--text-main)] tracking-tight mb-2 line-clamp-1">{task.title}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed line-clamp-2">{task.description}</p>
                </div>

                {/* Footer: Assigned To + Status */}
                <div className="mt-6 pt-5 border-t border-[var(--border-light)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[var(--bg-main)] border border-[var(--border-light)] flex items-center justify-center font-bold text-[var(--text-muted)] text-sm">
                      {task.assignedTo?.name?.charAt(0) || <User size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-main)] leading-none">{task.assignedTo?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5">Assignee</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${status.color}`}>
                    <StatusIcon size={14} />
                    <span>{status.label}</span>
                  </div>
                </div>

                {/* Role-based Actions */}
                <div className="mt-4 flex items-center justify-end gap-2">
                  {user?._id === task.assignedTo?._id && task.status !== 'completed' && (
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(task._id, 'in_progress')}
                          className="px-3 py-1.5 bg-amber-100 text-amber-600 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-amber-200 transition-colors"
                        >
                          Start Work
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button 
                          onClick={() => handleUpdateStatus(task._id, 'completed')}
                          className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-green-200 transition-colors"
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  )}
                  {(user?.role === 'admin' || user?._id === task.createdBy?._id) && (
                    <button 
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Task Modal */}
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
                  <h3 className="text-2xl font-black mb-1">Assign New Task</h3>
                  <p className="text-blue-200 text-sm font-medium">Add a task to the team's operational pipeline.</p>
                </div>
                <button type="button" onClick={() => setShowModal(false)} className="relative z-10 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                  <X size={18} />
                </button>
                <div className="absolute right-6 bottom-0 opacity-10 pointer-events-none">
                  <Zap size={90} />
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Task Title</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Q2 Performance Audit"
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    rows="3"
                    className="input-field resize-none"
                    placeholder="Describe the task objectives..."
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Assign To</label>
                    <select
                      required
                      className="input-field cursor-pointer"
                      onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                    >
                      <option value="">Select employee</option>
                      {users.filter(u => u.role !== 'admin').map(u => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Due Date</label>
                    <input
                      type="date"
                      required
                      className="input-field cursor-pointer"
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Priority Level</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['high', 'medium', 'low'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({...formData, priority: p})}
                        className={`py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          formData.priority === p
                          ? 'bg-primary text-white border-transparent shadow-lg'
                          : 'bg-[var(--bg-main)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-primary hover:text-primary'
                        }`}
                      >
                        {p}
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
                  <button type="submit" className="flex-1 btn-primary">
                    Create Task
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

export default TaskManagement;
