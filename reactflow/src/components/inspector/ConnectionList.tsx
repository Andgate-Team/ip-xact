import type { Connection } from "../../types";

interface ConnectionListProps {
  connections: Connection[];
  direction: "incoming" | "outgoing";
  getName: (id: string) => string;
  onSelect: (id: string) => void;
}

export function ConnectionList({ connections, direction, getName, onSelect }: ConnectionListProps) {
  if (connections.length === 0) {
    return <div className="text-sm text-slate-500">No {direction} connections.</div>;
  }

  return (
    <ul className="space-y-2">
      {connections.map((connection) => {
        const peerId = direction === "incoming" ? connection.sourceComponentId : connection.targetComponentId;
        const fromPort = direction === "incoming" ? connection.sourcePortId : connection.targetPortId;
        const toPort = direction === "incoming" ? connection.targetPortId : connection.sourcePortId;

        return (
          <li key={connection.id} className="rounded-md border border-white/10 bg-white/[0.03] p-2.5">
            <button
              className="mb-1 text-left text-sm font-semibold text-cyan-100 hover:text-cyan-300"
              onClick={() => onSelect(peerId)}
              type="button"
            >
              {getName(peerId)}
            </button>
            <div className="font-mono text-[11px] text-slate-500">
              {fromPort} to {toPort}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
