import type { Register } from "../../../types";

interface NodeRegistersListProps {
  registers: Register[];
}

export function NodeRegistersList({ registers }: NodeRegistersListProps) {
  return (
    <ul className="space-y-1.5">
      {registers.map((register) => (
        <li key={register.id} className="flex items-center justify-between gap-3 text-xs text-slate-300">
          <span className="truncate">{register.name}</span>
          {register.address ? <span className="shrink-0 font-mono text-[10px] text-slate-500">{register.address}</span> : null}
        </li>
      ))}
    </ul>
  );
}
