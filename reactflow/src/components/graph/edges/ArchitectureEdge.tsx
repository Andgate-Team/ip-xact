import { memo, useMemo } from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getSmoothStepPath } from "reactflow";
import { useSelectionStore } from "../../../store/selectionStore";
import type { ArchitectureEdgeData } from "../../../types";
import type { ConnectionType } from "../../../lib/preprocess/types";

interface EdgeStyle {
  color: string;
  width: number;
  dash?: string;
  opacity: number;
}

const CONNECTION_STYLES: Record<ConnectionType, EdgeStyle> = {
  bus: { color: "#a78bfa", width: 3, opacity: 0.7 },
  interrupt: { color: "#f472b6", width: 2, dash: "6 4", opacity: 0.65 },
  dma: { color: "#2dd4bf", width: 2.5, opacity: 0.65 },
  clock: { color: "#f87171", width: 1.5, opacity: 0.55 },
  reset: { color: "#fb923c", width: 1.5, dash: "3 3", opacity: 0.55 },
  debug: { color: "#94a3b8", width: 1.5, dash: "2 4", opacity: 0.5 },
  data: { color: "#4ade80", width: 2, opacity: 0.6 },
  control: { color: "#facc15", width: 1.5, dash: "4 2", opacity: 0.55 },
  unknown: { color: "#64748b", width: 1.2, opacity: 0.45 }
};

function getEdgeStyle(
  connectionType: ConnectionType | undefined,
  highlighted: boolean,
  dimmed: boolean,
  isClusterEdge: boolean
): React.CSSProperties {
  if (highlighted) {
    return {
      stroke: "#67e8f9",
      strokeWidth: 3,
      opacity: 0.96,
      strokeDasharray: "7 5"
    };
  }

  if (dimmed) {
    return {
      stroke: "#64748b",
      strokeWidth: 1,
      opacity: 0.1
    };
  }

  if (isClusterEdge) {
    return {
      stroke: "#818cf8",
      strokeWidth: 1.5,
      opacity: 0.5,
      strokeDasharray: "4 3"
    };
  }

  const style = CONNECTION_STYLES[connectionType ?? "unknown"] ?? CONNECTION_STYLES.unknown;
  return {
    stroke: style.color,
    strokeWidth: style.width,
    opacity: style.opacity,
    strokeDasharray: style.dash
  };
}

function ArchitectureEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  source,
  target
}: EdgeProps<ArchitectureEdgeData>) {
  const highlighted = useSelectionStore((state) => state.highlightedEdgeIds.has(id));
  const hasSelection = useSelectionStore((state) => state.selectedNodeId !== null);
  const dimmed = hasSelection && !highlighted;

  const isClusterEdge = source.startsWith("hierarchy:") || target.startsWith("hierarchy:");

  const pathFn = useMemo(() => {
    return getSmoothStepPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition,
      targetPosition,
      borderRadius: 8
    });
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition]);

  const [edgePath, labelX, labelY] = pathFn;

  const style = getEdgeStyle(
    data?.connectionType,
    highlighted,
    dimmed,
    isClusterEdge
  );

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={highlighted ? "url(#architecture-arrow)" : undefined}
        style={style}
      />
      {highlighted && data ? (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded border border-cyan-300/30 bg-shell-950/90 px-2 py-1 text-[10px] text-cyan-100 shadow-lg"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            <div className="font-medium">{data.connection.sourcePortId} → {data.connection.targetPortId}</div>
            {data.connectionType && (
              <div className="mt-0.5 text-[9px] uppercase tracking-wide text-cyan-300/80">
                {data.connectionType}
              </div>
            )}
            {data.connectionCount && data.connectionCount > 1 && (
              <span className="ml-1 text-cyan-300">({data.connectionCount}x)</span>
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const ArchitectureEdge = memo(ArchitectureEdgeComponent);
