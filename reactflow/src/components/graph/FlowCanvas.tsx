import { useCallback, useEffect, useState, type MouseEvent } from "react";
import ReactFlow, { Controls, MarkerType, type Node, type Viewport, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import { useFitViewOnSelect } from "../../hooks/useFitViewOnSelect";
import { useGraphStore } from "../../store/graphStore";
import { useSelectionStore } from "../../store/selectionStore";
import type { ArchitectureEdgeData, ArchitectureNodeData } from "../../types";
import { BackgroundGrid } from "./BackgroundGrid";
import { MiniMapPanel } from "./MiniMapPanel";
import { edgeTypes } from "./edges/edgeTypeRegistry";
import { nodeTypes } from "./nodes/nodeTypeRegistry";

const defaultEdgeOptions = {
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#64748b"
  }
};

const MIN_ZOOM = 0.035;
const MAX_ZOOM = 2.2;
const OVERVIEW_ZOOM = 0.32;

function FlowCanvasInner() {
  const storeNodes = useGraphStore((state) => state.nodes);
  const storeEdges = useGraphStore((state) => state.edges);
  const updateNodePosition = useGraphStore((state) => state.updateNodePosition);
  const toggleCluster = useGraphStore((state) => state.toggleCluster);
  const selectNode = useSelectionStore((state) => state.selectNode);
  const focusNode = useFitViewOnSelect();
  const [nodes, setNodes, onNodesChange] = useNodesState<ArchitectureNodeData>(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ArchitectureEdgeData>(storeEdges);
  const [isOverview, setIsOverview] = useState(false);

  useEffect(() => setNodes(storeNodes), [setNodes, storeNodes]);
  useEffect(() => setEdges(storeEdges), [setEdges, storeEdges]);

  const handleNodeClick = useCallback(
    (_event: MouseEvent, node: Node<ArchitectureNodeData>) => {
      selectNode(node.data.kind === "component" ? node.id : null);
    },
    [selectNode]
  );

  const handleNodeDoubleClick = useCallback(
    (event: MouseEvent, node: Node<ArchitectureNodeData>) => {
      event.preventDefault();
      if (node.data.kind === "cluster") {
        toggleCluster(node.id);
        selectNode(null);
        return;
      }

      focusNode(node.id);
    },
    [focusNode, selectNode, toggleCluster]
  );

  const handleNodeDragStop = useCallback(
    (_event: MouseEvent, node: Node<ArchitectureNodeData>) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  const handleMove = useCallback((_event: unknown, viewport: Viewport) => {
    setIsOverview((current) => {
      const next = viewport.zoom <= OVERVIEW_ZOOM;
      return current === next ? current : next;
    });
  }, []);

  return (
    <ReactFlow
      className={isOverview ? "architecture-flow architecture-flow--overview" : "architecture-flow"}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onNodeDragStop={handleNodeDragStop}
      onMove={handleMove}
      onPaneClick={() => selectNode(null)}
      fitView
      fitViewOptions={{ padding: 0.18, minZoom: MIN_ZOOM, maxZoom: 0.9 }}
      onlyRenderVisibleElements
      zoomOnDoubleClick={false}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      proOptions={{ hideAttribution: true }}
    >
      <svg>
        <defs>
          <marker id="architecture-arrow" markerHeight="12" markerWidth="12" orient="auto" refX="10" refY="6">
            <path d="M2,2 L10,6 L2,10 z" fill="#67e8f9" />
          </marker>
        </defs>
      </svg>
      <BackgroundGrid />
      <Controls className="!border !border-white/10 !bg-shell-950/90 !fill-slate-200 !text-slate-200" />
      <MiniMapPanel />
    </ReactFlow>
  );
}

export function FlowCanvas() {
  return <FlowCanvasInner />;
}
