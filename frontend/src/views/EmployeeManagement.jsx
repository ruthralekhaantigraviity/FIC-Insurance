import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  UserPlus, Mail, Shield, MapPin, 
  Edit3, Trash2, X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const roleColors = {
  admin:       { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
  team_leader: { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100'   },
  employee:    { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-100'  },
};

const avatarGradients = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-green-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
];

const EmployeeManagement = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const initialFormState = {
    name: '',
    email: '',
    password: 'password123',
    role: 'employee',
    branch: user?.branch || 'Main Office',
    team: 'Direct Sales'
  };
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/users');
      let data = res.data;
      if (user?.role === 'team_leader') {
        data = data.filter(emp => emp.branch === user.branch);
      }
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const openEditModal = (emp) => {
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role || 'employee',
      branch: emp.branch || 'Main Office',
      team: emp.team || 'Direct Sales'
    });
    setEditingId(emp._id);
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, formData);
        toast.success('Employee details updated!');
      } else {
        await api.post('/users', formData);
        toast.success('Employee successfully added!');
      }
      closeModal();
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleDelete = async (empId, empName) => {
    if (!window.confirm(`Are you sure you want to permanently remove ${empName}?`)) return;
    try {
      await api.delete(`/users/${empId}`);
      toast.success(`${empName} has been removed.`);
      fetchEmployees();
    } catch (err) {
      toast.error('Failed to remove employee');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[var(--bg-card)] p-8 rounded-[2rem] border border-[var(--border-light)] shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-main)]">Staff Management</h2>
          <p className="text-[var(--text-muted)] font-medium mt-1">
            Manage team profiles, roles, and branch assignments.
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary group"
          >
            <UserPlus size={18} className="group-hover:scale-110 transition-transform" />
            <span>Add New Staff</span>
          </button>
        )}
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="card h-56 animate-pulse bg-[var(--bg-main)] rounded-[2rem]"></div>
            ))
          ) : employees.map((emp, i) => {
            const role = roleColors[emp.role?.toLowerCase()] || roleColors['employee'];
            const gradient = avatarGradients[i % avatarGradients.length];
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                key={emp._id}
                className="card card-hover group relative overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-2xl shadow-lg flex-shrink-0`}>
                      {emp.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <h3 className="font-black text-[var(--text-main)] leading-none text-base">{emp.name}</h3>
                      <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${role.bg} ${role.border}`}>
                        <Shield size={10} className={role.text} />
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${role.text}`}>{emp.role}</span>
                      </div>
                    </div>
                  </div>
                  {user?.role === 'admin' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDelete(emp._id, emp.name)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 border border-red-100 transition-all z-10"
                        title="Remove Staff"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button 
                        onClick={() => openEditModal(emp)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-primary hover:bg-primary/10 border border-[var(--border-light)] transition-all z-10"
                        title="Edit Profile"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                      <Mail size={13} />
                    </div>
                    <span className="text-[var(--text-main)] font-medium truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-muted)] flex-shrink-0">
                      <MapPin size={13} />
                    </div>
                    <span className="text-[var(--text-main)] font-medium">{emp.branch || 'Main Office'}</span>
                    {emp.team && (
                      <>
                        <span className="text-[var(--border-medium)]">/</span>
                        <span className="text-[var(--text-muted)]">{emp.team}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-5 border-t border-[var(--border-light)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${emp.isActive !== false ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {emp.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-widest mb-0.5">Earnings</p>
                    <p className="text-base font-black text-[var(--text-main)]">₹{(emp.wallet || 0).toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && (
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
                  <h3 className="text-2xl font-black mb-1">{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
                  <p className="text-blue-200 text-sm font-medium">{editingId ? 'Modify profile and credentials.' : 'Provision access and credentials for a new team member.'}</p>
                </div>
                <button type="button" onClick={closeModal} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                  <X size={18} />
                </button>
                <div className="absolute right-6 bottom-0 opacity-10"><UserPlus size={90} /></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Ravi Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Email Address (Username)</label>
                  <input
                    type="email"
                    required
                    className="input-field disabled:opacity-50"
                    placeholder="ravi@ficinsurance.com"
                    value={formData.email}
                    disabled={!!editingId}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {!editingId && (
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Initial Password</label>
                    <input
                      type="text"
                      required
                      className="input-field"
                      placeholder="Enter temporary password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Role</label>
                    <select
                      className="input-field cursor-pointer"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="employee">Employee</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Branch</label>
                    <select
                      className="input-field cursor-pointer disabled:opacity-50"
                      value={formData.branch}
                      disabled={user?.role === 'team_leader'}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    >
                      <option value="Thirupathur">Thirupathur</option>
                      <option value="Krishanagiri">Krishanagiri</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Bangalore">Bangalore</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-4 bg-[var(--bg-main)] text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-widest rounded-2xl hover:bg-[var(--border-light)] transition-all border border-[var(--border-light)]"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingId ? 'Save Changes' : 'Add Employee'}
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

export default EmployeeManagement;
