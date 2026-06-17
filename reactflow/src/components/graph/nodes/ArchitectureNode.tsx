import clsx from "clsx";
import { memo, type CSSProperties, useMemo } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { nodeColorMap } from "../../../lib/transform/colorMap";
import type { ArchitectureNodeData } from "../../../types";
import { useNodeHighlighting } from "../../../hooks/useNodeHighlighting";
import { useGraphStore } from "../../../store/graphStore";
import { NodeHeader } from "./NodeHeader";

const NODE_HEIGHT = 88;
const PORT_PADDING = 12;

function ArchitectureNodeComponent({ id, data }: NodeProps<ArchitectureNodeData>) {
  const isCluster = data.kind === "cluster";
  const name = isCluster ? data.cluster.name : data.component.name;
  const type = isCluster ? data.cluster.type : data.component.type;
  const colors = nodeColorMap[type];
  const { isSelected, isDimmed } = useNodeHighlighting(id);
  const expandToLevel = useGraphStore((state) => state.expandToLevel);
  const expansionPath = useGraphStore((state) => state.expansionPath);

  const isExpanded = isCluster && expansionPath.includes(data.cluster.id);
  const depth = isCluster ? data.cluster.depth : 0;
  const isExpandable = isCluster && (data.cluster.depth < 2 || data.cluster.componentCount > 12);
  const parentGroupName = isCluster && depth > 1
    ? expansionPath[expansionPath.indexOf(data.cluster.id) - 1]?.replace("hierarchy:", "").replace(/:/g, " > ")
    : null;

  const portPositions = useMemo(() => {
    if (data.kind !== "component") return new Map<string, number>();

    const elkPositions = data.portPositions;
    if (elkPositions && elkPositions.length > 0) {
      const map = new Map<string, number>();
      for (const pos of elkPositions) {
        map.set(pos.portId, pos.y);
      }
      return map;
    }

    const ports = data.component.ports;
    const leftPorts = ports.filter((p) => p.direction === "in" || p.direction === "inout");
    const rightPorts = ports.filter((p) => p.direction === "out" || p.direction === "inout");

    const positions = new Map<string, number>();

    leftPorts.forEach((port, idx) => {
      const spacing = (NODE_HEIGHT - PORT_PADDING * 2) / Math.max(leftPorts.length - 1, 1);
      const y = leftPorts.length === 1
        ? NODE_HEIGHT / 2
        : PORT_PADDING + idx * spacing;
      positions.set(port.id, y);
    });

    rightPorts.forEach((port, idx) => {
      const spacing = (NODE_HEIGHT - PORT_PADDING * 2) / Math.max(rightPorts.length - 1, 1);
      const y = rightPorts.length === 1
        ? NODE_HEIGHT / 2
        : PORT_PADDING + idx * spacing;
      positions.set(port.id, y);
    });

    return positions;
  }, [data]);

  return (
    <div
      className={clsx(
        "architecture-node group overflow-hidden rounded-xl border bg-gradient-to-br from-shell-800 to-shell-950 shadow-node transition duration-150",
        isCluster ? "w-[280px]" : "w-[220px]",
        "hover:-translate-y-0.5 hover:shadow-glow",
        isSelected && "ring-2 ring-cyan-200/70",
        isDimmed && "opacity-30 grayscale"
      )}
      style={
        {
          borderColor: isSelected ? colors.border : "rgba(255,255,255,0.12)",
          "--node-glow": colors.glow
        } as CSSProperties
      }
    >
      {isCluster ? null : data.component.ports.map((port) => {
        const handleId = `port:${data.component.id}:${port.id}`;
        const isIn = port.direction === "in";
        const isOut = port.direction === "out";
        const isInOut = port.direction === "inout";
        const yPos = portPositions.get(port.id) ?? NODE_HEIGHT / 2;

        const handles: React.ReactElement[] = [];

        if (isIn || isInOut) {
          handles.push(
            <Handle
              key={`in:${handleId}`}
              className="!h-2.5 !w-2.5 !border-0 !bg-slate-400 hover:!bg-cyan-400"
              id={handleId}
              type="target"
              position={Position.Left}
              style={{ top: `${yPos}px` }}
            />
          );
        }

        if (isOut || isInOut) {
          handles.push(
            <Handle
              key={`out:${handleId}`}
              className="!h-2.5 !w-2.5 !border-0 !bg-slate-400 hover:!bg-cyan-400"
              id={handleId}
              type="source"
              position={Position.Right}
              style={{ top: `${yPos}px` }}
            />
          );
        }

        return handles;
      })}
      <div className="flex">
        <div
          className={clsx("architecture-node__rail w-1.5 shrink-0", depth > 0 && "opacity-80")}
          style={{ backgroundColor: colors.base }}
        />
        <div className="architecture-node__content min-w-0 flex-1 p-3.5">
          <NodeHeader
            name={name}
            type={type}
            color={colors.border}
            expanded={false}
            depth={depth}
            isExpandable={isExpandable}
            isExpanded={isExpanded}
            onExpand={() => isCluster && expandToLevel(data.cluster.id)}
          />
          {isCluster ? (
            <>
              {parentGroupName && (
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span>Inside {parentGroupName}</span>
                </div>
              )}
              <div className="architecture-node__meta mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <span className="rounded bg-white/[0.04] px-2 py-1">{data.cluster.componentCount} blocks</span>
                <span className="rounded bg-white/[0.04] px-2 py-1">{data.cluster.connectionCount} links</span>
              </div>
              {data.cluster.typeBreakdown && Object.keys(data.cluster.typeBreakdown).length > 1 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(data.cluster.typeBreakdown).map(([t, count]) => (
                    <span key={t} className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-slate-500">
                      {t}: {count}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export const ArchitectureNode = memo(ArchitectureNodeComponent, (previous, next) => {
  return (
    previous.id === next.id &&
    previous.selected === next.selected &&
    previous.data.kind === next.data.kind &&
    (previous.data.kind === "cluster"
      ? next.data.kind === "cluster" &&
        previous.data.cluster.id === next.data.cluster.id &&
        previous.data.cluster.componentCount === next.data.cluster.componentCount &&
        previous.data.cluster.connectionCount === next.data.cluster.connectionCount &&
        previous.data.cluster.depth === next.data.cluster.depth
      : next.data.kind === "component" &&
        previous.data.component.id === next.data.component.id &&
        previous.data.component.name === next.data.component.name &&
        previous.data.component.type === next.data.component.type)
  );
});
