import { nodeColorMap } from "../../lib/transform/colorMap";
import { useArchitectureStore } from "../../store/architectureStore";
import { useSelectionStore } from "../../store/selectionStore";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";
import { ConnectionList } from "./ConnectionList";
import { InspectorSection } from "./InspectorSection";
import { useFitViewOnSelect } from "../../hooks/useFitViewOnSelect";
import type { Connection } from "../../types";

const EMPTY_CONNECTIONS: Connection[] = [];

export function InspectorPanel() {
  const selectedNodeId = useSelectionStore((state) => state.selectedNodeId);
  const component = useArchitectureStore((state) => (selectedNodeId ? state.componentById.get(selectedNodeId) : undefined));
  const incoming = useArchitectureStore((state) => (selectedNodeId ? state.getIncoming(selectedNodeId) : EMPTY_CONNECTIONS));
  const outgoing = useArchitectureStore((state) => (selectedNodeId ? state.getOutgoing(selectedNodeId) : EMPTY_CONNECTIONS));
  const getComponent = useArchitectureStore((state) => state.getComponent);
  const focusNode = useFitViewOnSelect();

  if (!component) {
    return (
      <Panel className="flex h-full w-[360px] shrink-0 items-center justify-center p-8 text-center text-sm text-slate-500">
        Select a block to inspect ports, registers, and live connections.
      </Panel>
    );
  }

  const colors = nodeColorMap[component.type];
  const getName = (id: string) => getComponent(id)?.name ?? id;

  return (
    <Panel className="h-full w-[360px] shrink-0 overflow-y-auto p-5">
      <div className="mb-5">
        <Badge color={colors.border}>{component.type}</Badge>
        <h2 className="mt-3 text-xl font-semibold text-slate-50">{component.name}</h2>
        <p className="mt-1 font-mono text-xs text-slate-500">{component.id}</p>
      </div>

      <InspectorSection title="Ports">
        <ul className="space-y-2">
          {component.ports.map((port) => (
            <li key={port.id} className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-2 text-sm">
              <span className="text-slate-200">{port.name}</span>
              <span className="font-mono text-xs text-slate-500">
                {port.direction}
                {port.width ? `:${port.width}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </InspectorSection>

      <InspectorSection title="Registers">
        <ul className="space-y-2">
          {component.registers.map((register) => (
            <li key={register.id} className="rounded-md bg-white/[0.03] px-3 py-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-200">{register.name}</span>
                {register.address ? <span className="font-mono text-xs text-slate-500">{register.address}</span> : null}
              </div>
              {register.description ? <p className="mt-1 text-xs text-slate-500">{register.description}</p> : null}
            </li>
          ))}
        </ul>
      </InspectorSection>

      <InspectorSection title="Incoming">
        <ConnectionList connections={incoming} direction="incoming" getName={getName} onSelect={focusNode} />
      </InspectorSection>

      <InspectorSection title="Outgoing">
        <ConnectionList connections={outgoing} direction="outgoing" getName={getName} onSelect={focusNode} />
      </InspectorSection>
    </Panel>
  );
}
