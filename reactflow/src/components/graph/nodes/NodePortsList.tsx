import type { Port } from "../../../types";

interface NodePortsListProps {
  ports: Port[];
}

export function NodePortsList({ ports }: NodePortsListProps) {
  return (
    <ul className="space-y-1.5">
      {ports.map((port) => (
        <li key={port.id} className="flex items-center justify-between gap-3 text-xs text-slate-300">
          <span className="truncate">{port.name}</span>
          <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
            {port.direction}
            {port.width ? `:${port.width}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
