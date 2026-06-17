import type { ComponentType } from "../../../types";

const typeIcon: Record<ComponentType, string> = {
  cpu: "CPU",
  bus: "BUS",
  memory: "MEM",
  peripheral: "I/O",
  interface: "PAD",
  clockReset: "CLK",
  custom: "IP",
  dma: "DMA",
  interruptController: "INT",
  debug: "DBG"
};

interface NodeHeaderProps {
  name: string;
  type: ComponentType;
  color: string;
  expanded: boolean;
  depth?: number;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
}

export function NodeHeader({ name, type, color, expanded, depth = 0, isExpandable, isExpanded, onExpand }: NodeHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {depth > 0 && (
        <div className="flex shrink-0 items-center gap-0.5">
          {Array.from({ length: depth }, (_, i) => (
            <div key={i} className="h-3 w-0.5 rounded-full bg-slate-600" />
          ))}
        </div>
      )}
      <div
        className="architecture-node__type grid h-10 w-10 shrink-0 place-items-center rounded-md border text-[10px] font-black"
        style={{ borderColor: color, color, backgroundColor: `${color}17` }}
      >
        {typeIcon[type]}
      </div>
      <div className="architecture-node__label min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-slate-50">{name}</div>
        {expanded ? <div className="mt-0.5 text-[11px] uppercase text-slate-400">Component</div> : null}
      </div>
      {isExpandable && (
        <button
          className="architecture-node__expand shrink-0 rounded p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
          onClick={(e) => {
            e.stopPropagation();
            onExpand?.();
          }}
        >
          <svg
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
