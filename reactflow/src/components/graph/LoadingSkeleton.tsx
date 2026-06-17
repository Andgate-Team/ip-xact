import { memo } from "react";

interface SkeletonNodeProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  delay?: number;
}

function SkeletonNodeComponent({ x, y, width = 220, height = 88, delay = 0 }: SkeletonNodeProps) {
  return (
    <div
      className="absolute animate-pulse rounded-xl border border-white/5 bg-gradient-to-br from-shell-800/50 to-shell-950/50"
      style={{
        left: x,
        top: y,
        width,
        height,
        animationDelay: `${delay}ms`,
        animationDuration: "1.5s"
      }}
    >
      <div className="flex h-full">
        <div className="w-1.5 shrink-0 rounded-l-xl bg-white/5" />
        <div className="flex-1 p-3.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-md bg-white/5" />
            <div className="flex-1">
              <div className="h-4 w-24 rounded bg-white/5" />
              <div className="mt-1 h-3 w-16 rounded bg-white/5" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-6 rounded bg-white/5" />
            <div className="h-6 rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

const SkeletonNode = memo(SkeletonNodeComponent);

interface SkeletonEdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay?: number;
}

function SkeletonEdgeComponent({ x1, y1, x2, y2, delay = 0 }: SkeletonEdgeProps) {
  const midX = (x1 + x2) / 2;
  const path = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;

  return (
    <path
      d={path}
      fill="none"
      stroke="rgba(255,255,255,0.05)"
      strokeWidth="1.5"
      strokeDasharray="4 4"
      className="animate-pulse"
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: "1.5s"
      }}
    />
  );
}

const SkeletonEdge = memo(SkeletonEdgeComponent);

export function LoadingSkeleton() {
  const nodes = [
    { x: 80, y: 60 },
    { x: 80, y: 200 },
    { x: 80, y: 340 },
    { x: 400, y: 130 },
    { x: 400, y: 270 },
    { x: 720, y: 60 },
    { x: 720, y: 200 },
    { x: 720, y: 340 }
  ];

  const edges = [
    { x1: 300, y1: 104, x2: 400, y2: 174 },
    { x1: 300, y1: 244, x2: 400, y2: 244 },
    { x1: 300, y1: 384, x2: 400, y2: 314 },
    { x1: 620, y1: 174, x2: 720, y2: 104 },
    { x1: 620, y1: 244, x2: 720, y2: 244 },
    { x1: 620, y1: 314, x2: 720, y2: 384 }
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-shell-950/80 backdrop-blur-sm">
      <div className="relative h-[480px] w-[960px]">
        <svg className="absolute inset-0 h-full w-full">
          {edges.map((edge, i) => (
            <SkeletonEdge key={i} {...edge} delay={i * 100} />
          ))}
        </svg>
        {nodes.map((node, i) => (
          <SkeletonNode key={i} {...node} delay={i * 100} />
        ))}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Computing layout...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
