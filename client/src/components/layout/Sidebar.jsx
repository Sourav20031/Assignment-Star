import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  BookmarkIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/dashboard/chat', label: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
  { to: '/dashboard/planner', label: 'Event Planner', icon: SparklesIcon },
  { to: '/dashboard/plans', label: 'Saved Plans', icon: BookmarkIcon },
  { to: '/dashboard/profile', label: 'Profile', icon: UserIcon },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Desktop sidebar — always visible */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar — slide in */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 z-30 flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <Logo />
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close sidebar">
                <XMarkIcon className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <SidebarContent showLogo={false} onNavClick={onClose} />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-glow">
        <SparklesIcon className="w-4 h-4 text-white" />
      </div>
      <span className="font-display font-bold text-lg text-slate-900 dark:text-white">EventGenius</span>
    </div>
  );
}

function SidebarContent({ showLogo = true, onNavClick }) {
  return (
    <div className="flex flex-col flex-1 p-4 gap-1 overflow-y-auto">
      {showLogo && (
        <div className="mb-6 mt-2">
          <Logo />
        </div>
      )}

      <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-3 mb-2">
        Navigation
      </p>

      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavClick}
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
          id={`sidebar-${label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {label}
        </NavLink>
      ))}

      {/* Decorative bottom */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="rounded-xl bg-gradient-to-br from-brand-50 to-purple-50 dark:from-brand-950/30 dark:to-purple-950/30 p-4">
          <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">Pro Tip ✨</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Use the AI Assistant to get personalized event ideas and vendor recommendations!
          </p>
        </div>
      </div>
    </div>
  );
}
