import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  BookmarkIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import StatCard from '../components/ui/StatCard.jsx';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardHome() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = analytics?.monthlyPlans?.map((m) => ({
    month: MONTHS[m._id.month - 1],
    plans: m.count,
    budget: m.totalBudget,
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="section-subtitle">Here's what's happening with your events.</p>
        </div>
        <Link to="/dashboard/planner" className="btn-primary hidden sm:flex" id="dashboard-new-plan-btn">
          <SparklesIcon className="w-4 h-4" />
          New Plan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<CalendarDaysIcon className="w-6 h-6" />}
          label="Total Plans"
          value={overview.totalPlans ?? 0}
          sub="Event plans created"
          color="brand"
        />
        <StatCard
          icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
          label="AI Conversations"
          value={overview.totalConversations ?? 0}
          sub={`${overview.totalMessages ?? 0} messages total`}
          color="purple"
        />
        <StatCard
          icon={<BookmarkIcon className="w-6 h-6" />}
          label="Favorites"
          value={overview.favoritePlans ?? 0}
          sub="Saved as favorites"
          color="amber"
        />
        <StatCard
          icon={<SparklesIcon className="w-6 h-6" />}
          label="Total Budget"
          value={`₹${((overview.totalBudget || 0) / 1000).toFixed(0)}K`}
          sub="Across all plans"
          color="emerald"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly plans bar chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card p-5">
          <h2 className="font-display font-semibold text-slate-800 dark:text-white mb-4">Monthly Activity</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="plans" fill="#6366f1" radius={[6, 6, 0, 0]} name="Plans Created" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Create your first event plan to see activity!" />
          )}
        </motion.div>

        {/* Event type pie chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-5">
          <h2 className="font-display font-semibold text-slate-800 dark:text-white mb-4">Event Types</h2>
          {analytics?.eventTypeDistribution?.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={analytics.eventTypeDistribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                    {analytics.eventTypeDistribution.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {analytics.eventTypeDistribution.map((item, i) => (
                  <div key={item.type} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{item.type}</span>
                    <span className="ml-auto font-semibold text-slate-800 dark:text-slate-200">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChart message="No event types yet. Generate a plan to get started!" />
          )}
        </motion.div>
      </div>

      {/* Recent activity row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent plans */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-800 dark:text-white">Recent Plans</h2>
            <Link to="/dashboard/plans" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {analytics?.recentPlans?.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentPlans.map((plan) => (
                <Link key={plan._id} to={`/dashboard/plans/${plan._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/50 dark:to-purple-900/50 flex items-center justify-center text-lg flex-shrink-0">
                    {getEventEmoji(plan.eventType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{plan.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{plan.guestCount} guests · ₹{plan.budget?.toLocaleString()}</p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon="📋" message="No plans yet" action={{ to: '/dashboard/planner', label: 'Create Plan' }} />
          )}
        </div>

        {/* Recent conversations */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-800 dark:text-white">Recent Chats</h2>
            <Link to="/dashboard/chat" className="text-sm text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
              View all <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {analytics?.recentConversations?.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentConversations.map((conv) => (
                <Link key={conv._id} to={`/dashboard/chat?id=${conv._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 flex items-center justify-center text-lg flex-shrink-0">
                    💬
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{conv.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{conv.lastMessage}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{conv.messageCount} msgs</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon="💬" message="No conversations yet" action={{ to: '/dashboard/chat', label: 'Start Chat' }} />
          )}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/planner', icon: '🎯', title: 'Plan an Event', desc: 'Generate a full AI event plan', color: 'from-brand-500 to-purple-600' },
          { to: '/dashboard/chat', icon: '🤖', title: 'Chat with AI', desc: 'Get personalized event advice', color: 'from-pink-500 to-rose-600' },
          { to: '/dashboard/plans', icon: '📁', title: 'View Saved Plans', desc: 'Browse your event collection', color: 'from-emerald-500 to-teal-600' },
        ].map(({ to, icon, title, desc, color }) => (
          <Link key={to} to={to} className="card-hover p-5 group">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-xl mb-3 shadow-md group-hover:shadow-lg transition-shadow`}>
              {icon}
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getEventEmoji(type) {
  const map = { wedding: '💍', birthday: '🎂', corporate: '🏢', graduation: '🎓', concert: '🎵', anniversary: '🎊', party: '🎉' };
  return map[type?.toLowerCase()] || '📅';
}

function EmptyChart({ message }) {
  return (
    <div className="h-48 flex items-center justify-center">
      <p className="text-sm text-slate-400 text-center">{message}</p>
    </div>
  );
}

function EmptyState({ icon, message, action }) {
  return (
    <div className="text-center py-8">
      <p className="text-3xl mb-2">{icon}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{message}</p>
      {action && (
        <Link to={action.to} className="btn-primary text-xs px-4 py-2">
          {action.label}
        </Link>
      )}
    </div>
  );
}
