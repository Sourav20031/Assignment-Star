import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-purple-700 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative text-center text-white px-12">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-8 animate-bounce-gentle">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-4xl font-black mb-4">Welcome Back!</h2>
          <p className="text-brand-100 text-lg leading-relaxed">
            Log in to continue planning amazing events with your AI assistant.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-4 text-sm">
            {['AI-Powered Plans', 'Budget Tracking', 'Vendor Suggestions', 'PDF Export'].map((f) => (
              <div key={f} className="bg-white/10 rounded-xl px-4 py-3 text-brand-100">✓ {f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">EventGenius</span>
          </Link>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Sign in</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Enter your credentials to access your dashboard.</p>

            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              <div>
                <label htmlFor="login-email" className="input-label">Email address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="login-password" className="input-label">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
                id="login-submit-btn"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
