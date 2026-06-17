import clsx from "clsx";
import { memo, type CSSProperties } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { nodeColorMap } from "../../../lib/transform/colorMap";
import type { ArchitectureNodeData } from "../../../types";
import { useNodeHighlighting } from "../../../hooks/useNodeHighlighting";
import { NodeHeader } from "./NodeHeader";

function ArchitectureNodeComponent({ id, data }: NodeProps<ArchitectureNodeData>) {
  const isCluster = data.kind === "cluster";
  const name = isCluster ? data.cluster.name : data.component.name;
  const type = isCluster ? data.cluster.type : data.component.type;
  const colors = nodeColorMap[type];
  const { isSelected, isDimmed } = useNodeHighlighting(id);

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
      {isCluster ? null : data.component.ports.map((port, idx) => {
        const handleId = `port:${data.component.id}:${port.id}`;
        const isIn = port.direction === "in";
        const isOut = port.direction === "out";
        const isInOut = port.direction === "inout";

        const handles: React.ReactElement[] = [];
        const offset = 6 + idx * 14;

        if (isIn || isInOut) {
          handles.push(
            <Handle
              key={`in:${handleId}`}
              className="!h-2 !w-2 !border-0 !bg-slate-400"
              id={handleId}
              type="target"
              position={Position.Left}
              style={{ top: `${offset}px` }}
            />
          );
        }

        if (isOut || isInOut) {
          handles.push(
            <Handle
              key={`out:${handleId}`}
              className="!h-2 !w-2 !border-0 !bg-slate-400"
              id={handleId}
              type="source"
              position={Position.Right}
              style={{ top: `${offset}px` }}
            />
          );
        }

        return handles;
      })}
      <div className="flex">
        <div className="architecture-node__rail w-1.5 shrink-0" style={{ backgroundColor: colors.base }} />
        <div className="architecture-node__content min-w-0 flex-1 p-3.5">
          <NodeHeader name={name} type={type} color={colors.border} expanded={false} />
          {isCluster ? (
            <div className="architecture-node__meta mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <span className="rounded bg-white/[0.04] px-2 py-1">{data.cluster.componentCount} blocks</span>
              <span className="rounded bg-white/[0.04] px-2 py-1">{data.cluster.connectionCount} links</span>
            </div>
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
        previous.data.cluster.connectionCount === next.data.cluster.connectionCount
      : next.data.kind === "component" &&
        previous.data.component.id === next.data.component.id &&
        previous.data.component.name === next.data.component.name &&
        previous.data.component.type === next.data.component.type)
  );
});
