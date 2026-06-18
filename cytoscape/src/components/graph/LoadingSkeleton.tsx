interface LoadingSkeletonProps {
  progress?: { current: number; total: number } | null;
}

export function LoadingSkeleton({ progress }: LoadingSkeletonProps) {
  const pct = progress ? Math.round((progress.current / progress.total) * 100) : null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-shell-950/80 backdrop-blur-sm z-20">
      <div className="text-center">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>
            {progress
              ? `Rendering ${progress.current.toLocaleString()} / ${progress.total.toLocaleString()} components (${pct}%)`
              : "Building architecture diagram..."}
          </span>
        </div>
        {progress && (
          <div className="mt-3 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
