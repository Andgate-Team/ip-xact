interface LoadingSkeletonProps {
  progress?: { current: number; total: number } | null;
  phase?: "layout" | "render";
}

export function LoadingSkeleton({ progress, phase = "layout" }: LoadingSkeletonProps) {
  const pct = progress ? Math.round((progress.current / progress.total) * 100) : null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-shell-950/80 backdrop-blur-sm">
      <div className="rounded-xl border border-white/10 bg-shell-900/95 p-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="h-10 w-10 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-cyan-400" />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-100">
              {phase === "layout" ? "Computing layout" : "Rendering graph"}
            </div>
            <div className="mt-0.5 text-xs text-slate-400">
              {progress
                ? `${progress.current.toLocaleString()} / ${progress.total.toLocaleString()} components`
                : "Analyzing architecture..."}
            </div>
          </div>
        </div>

        {progress && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span>{phase === "layout" ? "Layout computation" : "DOM rendering"}</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div className="h-2 w-72 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-300 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {!progress && (
          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" />
            </div>
            <span>This may take a moment for large architectures</span>
          </div>
        )}
      </div>
    </div>
  );
}
