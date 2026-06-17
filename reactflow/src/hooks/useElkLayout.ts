import { useEffect } from "react";
import type { ElkNode } from "elkjs";
import { flowToElkGraph } from "../lib/elk/elkAdapter";
import { getCachedLayout, getLayoutCacheKey, setCachedLayout } from "../lib/elk/layoutCache";
import { modelToFlow } from "../lib/transform/modelToFlow";
import { useArchitectureStore } from "../store/architectureStore";
import { useGraphStore } from "../store/graphStore";
import type { ArchitectureFlowNode } from "../types";

function applyLayout(nodes: ArchitectureFlowNode[], layout: ElkNode): ArchitectureFlowNode[] {
  const positions = new Map(layout.children?.map((child) => [child.id, { x: child.x ?? 0, y: child.y ?? 0 }]));

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id) ?? node.position
  }));
}

export function useElkLayout(): void {
  const model = useArchitectureStore((state) => state.model);
  const setNodes = useGraphStore((state) => state.setNodes);
  const setEdges = useGraphStore((state) => state.setEdges);
  const expandedClusterIds = useGraphStore((state) => state.expandedClusterIds);

  useEffect(() => {
    if (!model) {
      return;
    }

    const { nodes, edges } = modelToFlow(model, expandedClusterIds);
    setNodes(nodes);
    setEdges(edges);

    const cacheKey = `${getLayoutCacheKey(model)}::expanded:${[...expandedClusterIds].sort().join("|")}`;
    const cachedLayout = getCachedLayout(cacheKey);
    if (cachedLayout) {
      setNodes(applyLayout(nodes, cachedLayout));
      return;
    }

    const worker = new Worker(new URL("../lib/elk/layoutWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<{ layout?: ElkNode; error?: string }>) => {
      if (event.data.layout) {
        setCachedLayout(cacheKey, event.data.layout);
        setNodes(applyLayout(nodes, event.data.layout));
      } else {
        setNodes(nodes);
      }
      worker.terminate();
    };
    worker.onerror = () => {
      setNodes(nodes);
      worker.terminate();
    };
    worker.postMessage({ graph: flowToElkGraph(nodes, edges) });

    return () => worker.terminate();
  }, [expandedClusterIds, model, setEdges, setNodes]);
}
