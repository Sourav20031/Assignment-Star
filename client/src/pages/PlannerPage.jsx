import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

const EVENT_TYPES = [
  { value: 'Wedding', emoji: '💍' },
  { value: 'Birthday Party', emoji: '🎂' },
  { value: 'Corporate Event', emoji: '🏢' },
  { value: 'Graduation Party', emoji: '🎓' },
  { value: 'Anniversary', emoji: '🎊' },
  { value: 'Baby Shower', emoji: '👶' },
  { value: 'Concert / Music Event', emoji: '🎵' },
  { value: 'Farewell Party', emoji: '👋' },
  { value: 'Engagement', emoji: '💒' },
  { value: 'Festival / Cultural Event', emoji: '🎭' },
];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Ahmedabad', 'Surat', 'Other'];

export default function PlannerPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    eventType: '',
    budget: '',
    guestCount: '',
    city: '',
    preferredDate: '',
    additionalNotes: '',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form

  const totalSteps = 3;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventType || !form.budget || !form.guestCount || !form.city || !form.preferredDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('🤖 AI is crafting your perfect event plan...');

    try {
      const { data } = await api.post('/events/generate', form);
      toast.dismiss(toastId);
      toast.success('Event plan generated successfully! 🎉');
      navigate(`/dashboard/plans/${data.eventPlan._id}`);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!form.eventType;
    if (step === 2) return !!form.budget && !!form.guestCount && !!form.city;
    return !!form.preferredDate;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title flex items-center gap-2">
          <SparklesIcon className="w-7 h-7 text-brand-500" />
          AI Event Planner
        </h1>
        <p className="section-subtitle">Fill in the details and our AI will generate a complete event plan in seconds.</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step
                  ? 'bg-brand-600 text-white'
                  : s === step
                  ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${s === step ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
              {s === 1 ? 'Event Type' : s === 2 ? 'Details' : 'Date & Notes'}
            </span>
            {s < totalSteps && <div className={`h-0.5 w-8 sm:w-16 rounded ${s < step ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} id="planner-form">
        <AnimatePresence mode="wait">
          {/* Step 1 — Event Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-6"
            >
              <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-white mb-2">What type of event are you planning?</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Choose the event type to get tailored recommendations.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {EVENT_TYPES.map(({ value, emoji }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, eventType: value })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                      form.eventType === value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">{value}</span>
                  </button>
                ))}
              </div>

              {/* Custom event type */}
              <div className="mt-4">
                <label className="input-label">Or enter custom event type</label>
                <input
                  name="eventType"
                  type="text"
                  value={EVENT_TYPES.some(e => e.value === form.eventType) ? '' : form.eventType}
                  onChange={handleChange}
                  placeholder="e.g. Charity Gala, Product Launch..."
                  className="input"
                  id="planner-custom-event"
                />
              </div>
            </motion.div>
          )}

          {/* Step 2 — Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-6 space-y-5"
            >
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-white mb-1">Event Details</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Planning a <strong>{form.eventType}</strong>. Now let's add the specifics.</p>
              </div>

              <div>
                <label htmlFor="planner-budget" className="input-label">
                  Total Budget (₹) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                  <input
                    id="planner-budget"
                    name="budget"
                    type="number"
                    value={form.budget}
                    onChange={handleChange}
                    placeholder="500000"
                    className="input pl-8"
                    min="1000"
                    required
                  />
                </div>
                {form.budget && (
                  <p className="text-xs text-slate-500 mt-1">
                    ₹{Number(form.budget).toLocaleString('en-IN')} INR
                  </p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['50000', '200000', '500000', '1000000', '2000000'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setForm({ ...form, budget: b })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        form.budget === b ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
                      }`}
                    >
                      ₹{Number(b).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="planner-guests" className="input-label">
                  Guest Count <span className="text-red-400">*</span>
                </label>
                <input
                  id="planner-guests"
                  name="guestCount"
                  type="number"
                  value={form.guestCount}
                  onChange={handleChange}
                  placeholder="100"
                  className="input"
                  min="1"
                  required
                />
                <div className="flex gap-2 mt-2 flex-wrap">
                  {['25', '50', '100', '200', '500'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, guestCount: g })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        form.guestCount === g ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-300'
                      }`}
                    >
                      {g} guests
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="planner-city" className="input-label">
                  City <span className="text-red-400">*</span>
                </label>
                <select
                  id="planner-city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select city...</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Date & Notes */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="card p-6 space-y-5"
            >
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-800 dark:text-white mb-1">Almost there!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {form.eventType} for {form.guestCount} guests in {form.city} · Budget: ₹{Number(form.budget).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label htmlFor="planner-date" className="input-label">
                  Preferred Date <span className="text-red-400">*</span>
                </label>
                <input
                  id="planner-date"
                  name="preferredDate"
                  type="date"
                  value={form.preferredDate}
                  onChange={handleChange}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label htmlFor="planner-notes" className="input-label">Additional Notes (optional)</label>
                <textarea
                  id="planner-notes"
                  name="additionalNotes"
                  value={form.additionalNotes}
                  onChange={handleChange}
                  placeholder="Any specific requirements, themes, dietary restrictions, special requests..."
                  className="input min-h-[100px] resize-none"
                  rows={4}
                />
              </div>

              {/* Summary card */}
              <div className="bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-brand-100 dark:border-brand-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">📋 Event Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Type:</span> <span className="font-medium">{form.eventType}</span></div>
                  <div><span className="text-slate-500">Guests:</span> <span className="font-medium">{form.guestCount}</span></div>
                  <div><span className="text-slate-500">Budget:</span> <span className="font-medium">₹{Number(form.budget).toLocaleString('en-IN')}</span></div>
                  <div><span className="text-slate-500">City:</span> <span className="font-medium">{form.city}</span></div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6 justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-secondary">
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary"
              id={`planner-next-step-${step}`}
            >
              Next Step <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !canProceed()}
              className="btn-primary"
              id="planner-generate-btn"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Generate AI Plan
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
