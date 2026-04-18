import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Activity, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Activity,   text: 'Real-time Lead Pipeline Tracking'   },
  { icon: TrendingUp, text: 'Automated Incentive Calculation'     },
  { icon: Zap,        text: 'Secure Payment Link Integration'     },
];

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const { login }   = useContext(AuthContext);
  const navigate    = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-5xl flex rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden bg-white"
      >
        {/* ─── LEFT: Branding Panel ─── */}
        <div
          className="hidden md:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #1E3A8A 0%, #1e40af 60%, #2563eb 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-600/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

          {/* Logo */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 relative z-10"
          >
            <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-white tracking-tight leading-none block">FIC Elite</span>
              <span className="text-[10px] text-blue-300 font-bold tracking-[0.2em] uppercase">CRM Core</span>
            </div>
          </motion.div>

          {/* Hero Text */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="space-y-5 relative z-10"
          >
            <h1 className="text-[2.6rem] font-black text-white leading-[1.1] tracking-tight">
              Elevate Your<br />
              <span className="text-blue-300">Performance.</span>
            </h1>
            <p className="text-blue-100/75 text-base leading-relaxed max-w-xs">
              The premier lead management platform for high-velocity insurance specialists.
            </p>
          </motion.div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 relative z-10"
          >
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-medium text-blue-100/70">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <f.icon size={14} className="text-blue-300" />
                </div>
                {f.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── RIGHT: Login Form ─── */}
        <div className="flex-1 flex flex-col justify-center p-10 md:p-14 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="max-w-sm mx-auto w-full"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-2 mb-8 md:hidden">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <span className="text-lg font-black text-gray-900 tracking-tight">FIC Elite</span>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Sign In</h2>
              <p className="text-gray-500 text-sm font-medium">Enter your credentials to access the CRM portal.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Mail size={17} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@fic.com"
                    className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    <Lock size={17} />
                  </span>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1,  y:  0 }}
                  className="bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Hint */}
            <div className="mt-8 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Demo Credentials</p>
              <div className="space-y-1 text-xs font-medium text-gray-600">
                <p><span className="font-bold text-gray-400">Admin:</span> admin@fic.com / admin123</p>
                <p><span className="font-bold text-gray-400">Agent:</span> rahul@fic.com / password123</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
