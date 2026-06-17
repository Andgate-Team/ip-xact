import { useEffect } from "react";
import type { ElkNode } from "elkjs";
import { flowToElkGraph } from "../lib/elk/elkAdapter";
import { getCachedLayout, getLayoutCacheKey, setCachedLayout } from "../lib/elk/layoutCache";
import { modelToFlow } from "../lib/transform/modelToFlow";
import { useArchitectureStore } from "../store/architectureStore";
import { useGraphStore } from "../store/graphStore";
import type { ArchitectureFlowNode, PortPosition } from "../types";

function extractPortPositions(elkNode: ElkNode): PortPosition[] {
  if (!elkNode.ports) return [];

  return elkNode.ports.map((port) => {
    const side = (port as any).side ?? "LEFT";
    return {
      portId: port.id.replace(/^port:[^:]+:/, ""),
      x: port.x ?? 0,
      y: port.y ?? 0,
      side: side as PortPosition["side"]
    };
  });
}

function applyLayout(nodes: ArchitectureFlowNode[], layout: ElkNode): ArchitectureFlowNode[] {
  const layoutMap = new Map(layout.children?.map((child) => [child.id, child]));

  return nodes.map((node) => {
    const elkNode = layoutMap.get(node.id);
    if (!elkNode) return node;

    const base = {
      ...node,
      position: { x: elkNode.x ?? 0, y: elkNode.y ?? 0 }
    };

    if (node.data.kind === "component") {
      const portPositions = extractPortPositions(elkNode);
      return {
        ...base,
        data: {
          ...node.data,
          portPositions: portPositions.length > 0 ? portPositions : node.data.portPositions
        }
      };
    }

    return base;
  });
}

export function useElkLayout(): void {
  const model = useArchitectureStore((state) => state.model);
  const setNodes = useGraphStore((state) => state.setNodes);
  const setEdges = useGraphStore((state) => state.setEdges);
  const setLayoutLoading = useGraphStore((state) => state.setLayoutLoading);
  const expandedClusterIds = useGraphStore((state) => state.expandedClusterIds);
  const expansionPath = useGraphStore((state) => state.expansionPath);

  useEffect(() => {
    if (!model) {
      return;
    }

    const { nodes, edges } = modelToFlow(model, expandedClusterIds);
    setNodes(nodes);
    setEdges(edges);

    const cacheKey = getLayoutCacheKey(model, expansionPath);
    const cachedLayout = getCachedLayout(cacheKey);
    if (cachedLayout) {
      setNodes(applyLayout(nodes, cachedLayout));
      return;
    }

    setLayoutLoading(true);
    const worker = new Worker(new URL("../lib/elk/layoutWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<{ layout?: ElkNode; error?: string }>) => {
      if (event.data.layout) {
        setCachedLayout(cacheKey, event.data.layout);
        setNodes(applyLayout(nodes, event.data.layout));
      } else {
        setNodes(nodes);
      }
      setLayoutLoading(false);
      worker.terminate();
    };
    worker.onerror = () => {
      setNodes(nodes);
      setLayoutLoading(false);
      worker.terminate();
    };
    worker.postMessage({ graph: flowToElkGraph(nodes, edges) });

    return () => {
      setLayoutLoading(false);
      worker.terminate();
    };
  }, [expandedClusterIds, expansionPath, model, setEdges, setNodes, setLayoutLoading]);
}
