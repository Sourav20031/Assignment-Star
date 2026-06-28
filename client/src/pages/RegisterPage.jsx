import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: 'bg-red-500', width: 'w-1/4' };
    if (p.length < 8) return { label: 'Weak', color: 'bg-orange-500', width: 'w-2/4' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
    return { label: 'Good', color: 'bg-amber-500', width: 'w-3/4' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 via-brand-600 to-brand-700 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative text-center text-white px-12">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-8 animate-bounce-gentle">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-display text-4xl font-black mb-4">Start Planning Today!</h2>
          <p className="text-brand-100 text-lg leading-relaxed">
            Create your free account and start building perfect events with the power of AI.
          </p>
          <div className="mt-12 space-y-3 text-left">
            {[
              '🎯 AI generates complete event plans in under 2 minutes',
              '💰 Smart budget breakdowns and vendor suggestions',
              '📅 Automated timeline and task checklists',
              '📄 Export beautiful PDF event plans',
            ].map((f) => (
              <div key={f} className="text-sm text-brand-100">{f}</div>
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
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">EventGenius</span>
          </Link>

          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">Create account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Join thousands of event planners using AI.</p>

            <form onSubmit={handleSubmit} className="space-y-5" id="register-form">
              <div>
                <label htmlFor="reg-name" className="input-label">Full name</label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input"
                  required
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="input-label">Email address</label>
                <input
                  id="reg-email"
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
                <label htmlFor="reg-password" className="input-label">Password</label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="input pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all rounded-full`} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{strength.label}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="input-label">Confirm password</label>
                <input
                  id="reg-confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={`input ${form.confirm && form.confirm !== form.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  required
                />
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
                id="register-submit-btn"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Create Account 🚀'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
