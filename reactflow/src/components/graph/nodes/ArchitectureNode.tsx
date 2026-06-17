import clsx from "clsx";
import { memo, type CSSProperties } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { nodeColorMap } from "../../../lib/transform/colorMap";
import type { ArchitectureNodeData } from "../../../types";
import { useNodeHighlighting } from "../../../hooks/useNodeHighlighting";
import { useGraphStore } from "../../../store/graphStore";
import { NodeHeader } from "./NodeHeader";

function ArchitectureNodeComponent({ id, data }: NodeProps<ArchitectureNodeData>) {
  if (data.kind === "busChannel") return null;

  const isCluster = data.kind === "cluster";
  const name = isCluster ? data.cluster.name : data.component.name;
  const type = isCluster ? data.cluster.type : data.component.type;
  const colors = nodeColorMap[type];
  const { isSelected, isDimmed } = useNodeHighlighting(id);
  const expandToLevel = useGraphStore((state) => state.expandToLevel);
  const expansionPath = useGraphStore((state) => state.expansionPath);

  const isExpanded = isCluster && expansionPath.includes(data.cluster.id);
  const depth = isCluster ? data.cluster.depth : 0;
  const isExpandable = isCluster && (data.cluster.depth < 2 || data.cluster.componentCount > 6);
  const parentGroupName = isCluster && depth > 1
    ? expansionPath[expansionPath.indexOf(data.cluster.id) - 1]?.replace("hierarchy:", "").replace(/:/g, " > ")
    : null;

  const childCount = isCluster
    ? (data.cluster.componentCount > 6 ? data.cluster.componentCount : 0)
    : 0;

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
      {!isCluster && (
        <>
          <Handle
            className="!h-3 !w-1 !rounded-full !border-0 !bg-slate-500 hover:!bg-cyan-400"
            id={`left:${id}`}
            type="target"
            position={Position.Left}
            style={{ top: "50%" }}
          />
          <Handle
            className="!h-3 !w-1 !rounded-full !border-0 !bg-slate-500 hover:!bg-cyan-400"
            id={`right:${id}`}
            type="source"
            position={Position.Right}
            style={{ top: "50%" }}
          />
        </>
      )}
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
                  <span>{parentGroupName}</span>
                </div>
              )}
              <div className="architecture-node__meta mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="rounded bg-white/[0.04] px-2 py-1">
                  {data.cluster.componentCount} blocks
                </span>
                {childCount > 0 && (
                  <span className="rounded bg-cyan-500/10 px-2 py-1 text-cyan-400">
                    click to expand
                  </span>
                )}
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
  if (previous.data.kind === "busChannel" || next.data.kind === "busChannel") return false;
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
