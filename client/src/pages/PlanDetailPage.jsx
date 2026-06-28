import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { exportToPDF } from '../utils/pdfExport.js';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#14b8a6'];

const TABS = [
  { id: 'overview', label: 'Overview', icon: DocumentTextIcon },
  { id: 'budget', label: 'Budget', icon: CurrencyRupeeIcon },
  { id: 'vendors', label: 'Vendors', icon: BuildingStorefrontIcon },
  { id: 'timeline', label: 'Timeline', icon: ClockIcon },
  { id: 'checklist', label: 'Checklist', icon: CheckCircleIcon },
];

export default function PlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingInvitation, setGeneratingInvitation] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(({ data }) => setPlan(data.eventPlan))
      .catch(() => { toast.error('Plan not found.'); navigate('/dashboard/plans'); })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    const { data } = await api.put(`/events/${id}/favorite`);
    setPlan((p) => ({ ...p, isFavorite: data.isFavorite }));
    toast.success(data.isFavorite ? 'Added to favorites ❤️' : 'Removed from favorites');
  };

  const toggleChecklistItem = async (index) => {
    const newCompleted = !plan.plan.checklist[index].completed;
    try {
      await api.put(`/events/${id}/checklist/${index}`, { completed: newCompleted });
      setPlan((p) => {
        const checklist = [...p.plan.checklist];
        checklist[index] = { ...checklist[index], completed: newCompleted };
        return { ...p, plan: { ...p.plan, checklist } };
      });
    } catch {
      toast.error('Failed to update checklist.');
    }
  };

  const generateInvitation = async () => {
    setGeneratingInvitation(true);
    try {
      const { data } = await api.post(`/events/${id}/invitation`);
      setPlan((p) => ({ ...p, invitationMessage: data.invitationMessage }));
      toast.success('Invitation generated! 📩');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invitation.');
    } finally {
      setGeneratingInvitation(false);
    }
  };

  const generateImagePrompt = async () => {
    setGeneratingImage(true);
    try {
      const { data } = await api.post(`/events/${id}/image-prompt`);
      setPlan((p) => ({ ...p, imagePrompt: data.imagePrompt }));
      toast.success('Image prompt generated! 🎨');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate image prompt.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `🎉 Check out my ${plan.eventType} plan!\n\n📍 ${plan.city}\n📅 ${plan.preferredDate}\n👥 ${plan.guestCount} guests\n💰 Budget: ₹${plan.budget?.toLocaleString('en-IN')}\n\nPowered by EventGenius AI ✨`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePDFExport = async () => {
    setExporting(true);
    try {
      await exportToPDF(plan);
      toast.success('PDF exported successfully! 📄');
    } catch (err) {
      toast.error('Failed to export PDF.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!plan) return null;

  const completedTasks = plan.plan?.checklist?.filter((c) => c.completed).length || 0;
  const totalTasks = plan.plan?.checklist?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in" id="plan-detail-export">
      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <button onClick={() => navigate('/dashboard/plans')} className="btn-ghost p-2 flex-shrink-0">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="section-title truncate">{plan.title}</h1>
          <div className="flex gap-2 mt-1 flex-wrap">
            <span className="badge-brand">{plan.eventType}</span>
            <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{plan.city}</span>
            <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">📅 {plan.preferredDate}</span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={toggleFavorite}
            className={`p-2.5 rounded-xl border transition-all ${plan.isFavorite ? 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-rose-300'}`}
            aria-label="Toggle favorite"
          >
            {plan.isFavorite ? <HeartSolid className="w-5 h-5 text-rose-500" /> : <HeartIcon className="w-5 h-5 text-slate-400" />}
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="btn-secondary text-sm px-3 py-2"
            id="plan-whatsapp-btn"
            title="Share on WhatsApp"
          >
            <span>📱</span> Share
          </button>
          <button
            onClick={handlePDFExport}
            disabled={exporting}
            className="btn-secondary text-sm px-3 py-2"
            id="plan-pdf-btn"
          >
            {exporting ? <LoadingSpinner size="sm" /> : <DocumentArrowDownIcon className="w-4 h-4" />}
            PDF
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget', value: `₹${plan.budget?.toLocaleString('en-IN')}`, icon: '💰' },
          { label: 'Guest Count', value: plan.guestCount, icon: '👥' },
          { label: 'Per Head Budget', value: `₹${Math.round(plan.budget / plan.guestCount).toLocaleString('en-IN')}`, icon: '🧮' },
          { label: 'Tasks Completed', value: `${completedTasks}/${totalTasks}`, icon: '✅' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Checklist progress */}
      {totalTasks > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Progress</p>
            <span className="text-sm font-bold text-brand-600">{progress}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{completedTasks} of {totalTasks} tasks done</p>
        </div>
      )}

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-700">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 flex-shrink-0 ${
                activeTab === id
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
              id={`plan-tab-${id}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview tab */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {plan.plan?.theme && (
                <div className="bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-brand-100 dark:border-brand-800">
                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">✨ Suggested Theme</p>
                  <p className="font-display font-bold text-xl text-slate-800 dark:text-white">{plan.plan.theme}</p>
                </div>
              )}
              {plan.plan?.overview && (
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Event Overview</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{plan.plan.overview}</p>
                </div>
              )}
              {plan.plan?.highlights?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Key Highlights</h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {plan.plan.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <span className="text-brand-500 mt-0.5 flex-shrink-0">⭐</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{h}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invitation section */}
              <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 dark:text-white">AI Invitation Message</h3>
                  <button
                    onClick={generateInvitation}
                    disabled={generatingInvitation}
                    className="btn-secondary text-xs px-3 py-1.5"
                    id="plan-generate-invitation-btn"
                  >
                    {generatingInvitation ? <LoadingSpinner size="sm" /> : <><SparklesIcon className="w-3.5 h-3.5" /> Generate</>}
                  </button>
                </div>
                {plan.invitationMessage ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{plan.invitationMessage}</pre>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Click Generate to create a personalized invitation message for your event.</p>
                )}
              </div>

              {/* AI Image prompt */}
              <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-800 dark:text-white">🎨 AI Image Prompt</h3>
                  <button
                    onClick={generateImagePrompt}
                    disabled={generatingImage}
                    className="btn-secondary text-xs px-3 py-1.5"
                    id="plan-generate-image-btn"
                  >
                    {generatingImage ? <LoadingSpinner size="sm" /> : <><SparklesIcon className="w-3.5 h-3.5" /> Generate</>}
                  </button>
                </div>
                {plan.imagePrompt ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">"{plan.imagePrompt}"</p>
                    <p className="text-xs text-slate-400 mt-2">Use this prompt in Midjourney, DALL·E, or Stable Diffusion to visualize your event.</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Generate an AI image prompt to visualize your event setup.</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Budget tab */}
          {activeTab === 'budget' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="grid lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={plan.plan?.budgetBreakdown || []}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%" cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {(plan.plan?.budgetBreakdown || []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                      formatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {(plan.plan?.budgetBreakdown || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
                          <span className="font-bold text-slate-800 dark:text-slate-100">₹{item.amount?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${item.percentage || 0}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                        {item.notes && <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>}
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-950/20 dark:to-purple-950/20 rounded-xl p-4 flex justify-between items-center border border-brand-100 dark:border-brand-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Budget</span>
                <span className="font-display text-2xl font-bold text-brand-600 dark:text-brand-400">₹{plan.budget?.toLocaleString('en-IN')}</span>
              </div>
            </motion.div>
          )}

          {/* Vendors tab */}
          {activeTab === 'vendors' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-2 gap-4">
              {(plan.plan?.vendors || []).map((vendor, i) => (
                <div key={i} className="card p-4 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-purple-100 dark:from-brand-900/40 dark:to-purple-900/40 flex items-center justify-center text-lg flex-shrink-0">
                      {getCategoryEmoji(vendor.category)}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{vendor.category}</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{vendor.name}</p>
                      {vendor.estimatedCost && (
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">{vendor.estimatedCost}</p>
                      )}
                      {vendor.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{vendor.notes}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-4">
                {(plan.plan?.timeline || []).map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 shadow-sm ${
                      item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}>
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="card p-4 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">{item.timeframe}</p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">{item.task}</p>
                        </div>
                        <span className={`badge flex-shrink-0 ${item.priority === 'high' ? 'badge-red' : item.priority === 'medium' ? 'badge-gold' : 'badge-green'}`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Checklist tab */}
          {activeTab === 'checklist' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{completedTasks}/{totalTasks} tasks completed</p>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full w-48 overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Group by category */}
              {groupChecklist(plan.plan?.checklist || []).map(({ category, items }) => (
                <div key={category} className="mb-5">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{category}</p>
                  <div className="space-y-2">
                    {items.map(({ item, originalIndex }) => (
                      <button
                        key={originalIndex}
                        onClick={() => toggleChecklistItem(originalIndex)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          item.completed
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-brand-300'
                        }`}
                        id={`checklist-item-${originalIndex}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {item.completed && <span className="text-white text-xs">✓</span>}
                        </div>
                        <span className={`text-sm flex-1 ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.task}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCategoryEmoji(cat = '') {
  const map = { venue: '🏛️', caterer: '🍽️', photographer: '📸', dj: '🎵', entertainment: '🎭', decorator: '🌸', florist: '💐', transportation: '🚗', videographer: '🎬' };
  const key = Object.keys(map).find((k) => cat.toLowerCase().includes(k));
  return map[key] || '🏪';
}

function groupChecklist(checklist) {
  const groups = {};
  checklist.forEach((item, i) => {
    const cat = item.category || 'General';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push({ item, originalIndex: i });
  });
  return Object.entries(groups).map(([category, items]) => ({ category, items }));
}
