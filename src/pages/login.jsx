import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = 'Email or phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await login(formData);
      const role = response.user?.role || 'tenant';
      navigate(`/${role}-dashboard`);
    } catch (error) {
      setErrors({ submit: error.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 translate-y-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 text-2xl font-semibold mb-6">
            <img src="/images/logo.png" alt="NyumbaSync" className="h-12 w-12 rounded-full bg-white/10 p-1" />
            NyumbaSync
          </Link>
          <h2 className="text-3xl font-bold mt-4">Welcome Back</h2>
          <p className="text-white/70 mt-2">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email or Phone
              </label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="example@email.com or +254 700 123456"
              />
              {errors.identifier && <p className="mt-2 text-sm text-red-400">{errors.identifier}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/80">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-2 text-sm text-red-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-indigo-400 hover:text-indigo-300">
                Sign up
              </Link>
            </p>
          </div>

          {/* Quick role selection hint */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-white/50 text-center mb-3">Sign in as:</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs text-white/60">🏠 Tenant</span>
              <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs text-white/60">🏢 Landlord</span>
              <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs text-white/60">💼 Agent</span>
              <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs text-white/60">📋 Manager</span>
              <span className="px-3 py-1 bg-slate-800/50 rounded-full text-xs text-white/60">🔧 Vendor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

