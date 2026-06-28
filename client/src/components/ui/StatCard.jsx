import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, sub, color = 'brand', trend }) {
  const colorMap = {
    brand: 'from-brand-500 to-brand-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
  };

  const bgMap = {
    brand: 'bg-brand-50 dark:bg-brand-950/30',
    purple: 'bg-purple-50 dark:bg-purple-950/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30',
    amber: 'bg-amber-50 dark:bg-amber-950/30',
    rose: 'bg-rose-50 dark:bg-rose-950/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold font-display text-slate-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</p>}
          {trend !== undefined && (
            <p className={`text-xs font-medium mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgMap[color]}`}>
          <div className={`w-6 h-6 text-transparent bg-gradient-to-br ${colorMap[color]} bg-clip-text`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
