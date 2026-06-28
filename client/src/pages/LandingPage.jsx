import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

const features = [
  { icon: SparklesIcon, title: 'AI Event Planning', desc: 'Generate complete event plans with budgets, vendors, and timelines instantly.', color: 'from-brand-500 to-purple-600' },
  { icon: ChatBubbleLeftRightIcon, title: 'Smart AI Assistant', desc: 'Chat with our expert AI event planner for personalized advice and ideas.', color: 'from-pink-500 to-rose-600' },
  { icon: CalendarDaysIcon, title: 'Timeline Generator', desc: 'Auto-generate detailed event timelines and task checklists.', color: 'from-emerald-500 to-teal-600' },
  { icon: ChartBarIcon, title: 'Budget Analytics', desc: 'Visual budget breakdowns with interactive charts and cost optimization.', color: 'from-amber-500 to-orange-600' },
  { icon: DocumentArrowDownIcon, title: 'PDF Export', desc: 'Export your complete event plan as a beautifully formatted PDF.', color: 'from-cyan-500 to-blue-600' },
  { icon: MicrophoneIcon, title: 'Voice Input', desc: 'Use your voice to chat with the AI assistant hands-free.', color: 'from-violet-500 to-indigo-600' },
];

const eventTypes = ['💍 Wedding', '🎂 Birthday', '🏢 Corporate', '🎓 Graduation', '🎵 Concert', '🎊 Anniversary'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">EventGenius</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Log In</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2" id="landing-get-started-btn">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl" />
        <div className="absolute -top-20 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="badge-brand text-xs px-3 py-1 mb-6 inline-block">
              ✨ Powered by Google Gemini AI
            </span>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight text-balance">
              Plan Perfect Events<br />
              <span className="gradient-text">with AI Magic</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-balance">
              EventGenius combines AI intelligence with expert event planning knowledge to create stunning, personalized events in minutes — not weeks.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-base px-8 py-3" id="hero-start-btn">
                Start Planning Free 🚀
              </Link>
              <Link to="/login" className="btn-secondary text-base px-8 py-3">
                See How It Works →
              </Link>
            </div>
          </motion.div>

          {/* Event type pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-16 flex flex-wrap gap-3 justify-center"
          >
            {eventTypes.map((type, i) => (
              <motion.span
                key={type}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:border-brand-300 hover:text-brand-600 transition-colors cursor-default"
              >
                {type}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: '10,000+', label: 'Events Planned' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '50+', label: 'Event Types' },
            { value: '<2 min', label: 'Plan Generation' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-3xl font-black gradient-text">{value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white">
            Everything You Need to Plan<br />
            <span className="gradient-text">The Perfect Event</span>
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            From AI-powered planning to vendor recommendations and budget tracking — we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="card-hover p-6 group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-shadow`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-purple-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-6">
              Ready to Plan Your Perfect Event?
            </h2>
            <p className="text-lg text-brand-100 mb-10">
              Join thousands of event planners using AI to create unforgettable experiences.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200" id="cta-register-btn">
              Get Started — It's Free ✨
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 py-10 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <SparklesIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-white">EventGenius</span>
        </div>
        <p className="text-sm text-slate-500">© 2024 EventGenius. Sourav Kumar ❤️</p>
      </footer>
    </div>
  );
}
