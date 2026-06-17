import type { ComponentType } from "../../../types";

const typeIcon: Record<ComponentType, string> = {
  cpu: "CPU",
  bus: "BUS",
  memory: "MEM",
  peripheral: "I/O",
  interface: "PAD",
  clockReset: "CLK",
  custom: "IP"
};

interface NodeHeaderProps {
  name: string;
  type: ComponentType;
  color: string;
  expanded: boolean;
}

export function NodeHeader({ name, type, color, expanded }: NodeHeaderProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div
        className="architecture-node__type grid h-10 w-10 shrink-0 place-items-center rounded-md border text-[10px] font-black"
        style={{ borderColor: color, color, backgroundColor: `${color}17` }}
      >
        {typeIcon[type]}
      </div>
      <div className="architecture-node__label min-w-0">
        <div className="truncate text-sm font-semibold text-slate-50">{name}</div>
        {expanded ? <div className="mt-0.5 text-[11px] uppercase text-slate-400">Component</div> : null}
      </div>
    </div>
  );
}
