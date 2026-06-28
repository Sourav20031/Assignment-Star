export default function LoadingSpinner({ fullscreen = false, size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className={`${sizes[size]} relative`}>
      <div className="absolute inset-0 rounded-full border-2 border-brand-200 dark:border-brand-800" />
      <div className="absolute inset-0 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-brand-200 dark:border-brand-800" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Loading EventGenius...</p>
        </div>
      </div>
    );
  }

  return spinner;
}
