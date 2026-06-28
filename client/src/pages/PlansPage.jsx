import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookmarkIcon,
  TrashIcon,
  HeartIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const EVENT_EMOJIS = { wedding: '💍', birthday: '🎂', corporate: '🏢', graduation: '🎓', anniversary: '🎊', concert: '🎵', party: '🎉', engagement: '💒', farewell: '👋', festival: '🎭', baby: '👶' };

function getEmoji(type = '') {
  const key = Object.keys(EVENT_EMOJIS).find((k) => type.toLowerCase().includes(k));
  return EVENT_EMOJIS[key] || '📅';
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | favorites

  useEffect(() => {
    api.get('/events')
      .then(({ data }) => {
        setPlans(data.plans);
        setFiltered(data.plans);
      })
      .catch(() => toast.error('Failed to load plans.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = plans;
    if (filter === 'favorites') result = result.filter((p) => p.isFavorite);
    if (search) result = result.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()) || p.eventType?.toLowerCase().includes(search.toLowerCase()) || p.city?.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, filter, plans]);

  const deletePlan = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this event plan?')) return;
    try {
      await api.delete(`/events/${id}`);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      toast.success('Plan deleted.');
    } catch {
      toast.error('Failed to delete plan.');
    }
  };

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { data } = await api.put(`/events/${id}/favorite`);
      setPlans((prev) => prev.map((p) => p._id === id ? { ...p, isFavorite: data.isFavorite } : p));
    } catch {
      toast.error('Failed to update favorite.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <BookmarkIcon className="w-6 h-6 text-brand-500" />
            Saved Event Plans
          </h1>
          <p className="section-subtitle">{plans.length} plans saved</p>
        </div>
        <Link to="/dashboard/planner" className="btn-primary hidden sm:flex" id="plans-new-plan-btn">
          <SparklesIcon className="w-4 h-4" />
          New Plan
        </Link>
      </div>

      {/* Search and filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search plans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            id="plans-search-input"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'favorites'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-brand-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-300'
              }`}
            >
              {f === 'all' ? 'All Plans' : '❤️ Favorites'}
            </button>
          ))}
        </div>
      </div>

      {/* Plans grid */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-4">{plans.length === 0 ? '📋' : '🔍'}</p>
          <p className="font-display font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {plans.length === 0 ? 'No plans yet' : 'No plans found'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {plans.length === 0 ? 'Create your first AI-powered event plan!' : 'Try a different search or filter.'}
          </p>
          {plans.length === 0 && (
            <Link to="/dashboard/planner" className="btn-primary mx-auto">
              <SparklesIcon className="w-4 h-4" />
              Create First Plan
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/dashboard/plans/${plan._id}`} className="card-hover block p-5 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/50 dark:to-purple-900/50 flex items-center justify-center text-2xl">
                    {getEmoji(plan.eventType)}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => toggleFavorite(plan._id, e)}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      aria-label="Toggle favorite"
                    >
                      {plan.isFavorite ? (
                        <HeartSolid className="w-4 h-4 text-rose-500" />
                      ) : (
                        <HeartIcon className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => deletePlan(plan._id, e)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Delete plan"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1 line-clamp-2">{plan.title}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge-brand">{plan.eventType}</span>
                  <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{plan.city}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-500 dark:text-slate-400">
                    <span className="block text-xs">Budget</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">₹{plan.budget?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    <span className="block text-xs">Guests</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.guestCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400">{plan.preferredDate}</span>
                  <ArrowRightIcon className="w-4 h-4 text-brand-500" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
