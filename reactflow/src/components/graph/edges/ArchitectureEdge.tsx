import { memo } from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "reactflow";
import { useSelectionStore } from "../../../store/selectionStore";
import type { ArchitectureEdgeData } from "../../../types";

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
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  const isClusterEdge = source.startsWith("hierarchy:") || target.startsWith("hierarchy:");

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={highlighted ? "url(#architecture-arrow)" : undefined}
        style={{
          stroke: highlighted ? "#67e8f9" : isClusterEdge ? "#818cf8" : "#64748b",
          strokeWidth: highlighted
            ? 2.7
            : isClusterEdge
              ? "var(--architecture-edge-width, 1.5)"
              : "var(--architecture-edge-width, 1.15)",
          opacity: dimmed ? 0.12 : highlighted ? 0.96 : isClusterEdge ? 0.6 : "var(--architecture-edge-opacity, 0.5)",
          strokeDasharray: highlighted ? "7 5" : isClusterEdge ? "4 3" : undefined
        }}
      />
      {highlighted && data ? (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded border border-cyan-300/30 bg-shell-950/90 px-2 py-1 text-[10px] text-cyan-100 shadow-lg"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {data.connection.sourcePortId} to {data.connection.targetPortId}
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
