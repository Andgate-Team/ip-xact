import { useEffect, useRef } from "react";
import type { ElkNode } from "elkjs";
import { flowToElkGraph } from "../lib/elk/elkAdapter";
import { getCachedLayout, getLayoutCacheKey, setCachedLayout } from "../lib/elk/layoutCache";
import { computeGridLayout } from "../lib/elk/gridLayout";
import { modelToFlow } from "../lib/transform/modelToFlow";
import { useArchitectureStore } from "../store/architectureStore";
import { useGraphStore } from "../store/graphStore";
import type { ArchitectureFlowNode, PortPosition } from "../types";
import type { PreprocessedArchitecture } from "../lib/preprocess";

const LARGE_GRAPH_THRESHOLD = 1000;

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

function applyLayout(nodes: ArchitectureFlowNode[], layout: ArchitectureFlowNode[]): ArchitectureFlowNode[] {
  const layoutMap = new Map(layout.map((n) => [n.id, n.position]));

  return nodes.map((node) => {
    const pos = layoutMap.get(node.id);
    if (!pos) return node;

    return {
      ...node,
      position: pos
    };
  });
}

function applyElkLayout(nodes: ArchitectureFlowNode[], elkLayout: ElkNode): ArchitectureFlowNode[] {
  const layoutMap = new Map(elkLayout.children?.map((child) => [child.id, child]));

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
  const preprocessedRef = useRef<PreprocessedArchitecture | null>(null);

  useEffect(() => {
    if (!model) {
      return;
    }

    const isLargeGraph = model.components.length > LARGE_GRAPH_THRESHOLD;

    if (isLargeGraph) {
      setLayoutLoading(true);

      const worker = new Worker(new URL("../lib/preprocess/preprocessWorker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<{ result?: PreprocessedArchitecture; error?: string }>) => {
        if (event.data.result) {
          preprocessedRef.current = event.data.result;
          const { nodes, edges } = modelToFlow(model, expandedClusterIds, event.data.result);
          setNodes(nodes);
          setEdges(edges);

          const gridNodes = computeGridLayout(nodes, edges);
          setNodes(applyLayout(nodes, gridNodes));
        } else {
          const { nodes, edges } = modelToFlow(model, expandedClusterIds);
          setNodes(nodes);
          setEdges(edges);
          const gridNodes = computeGridLayout(nodes, edges);
          setNodes(applyLayout(nodes, gridNodes));
        }
        setLayoutLoading(false);
        worker.terminate();
      };
      worker.onerror = () => {
        const { nodes, edges } = modelToFlow(model, expandedClusterIds);
        setNodes(nodes);
        setEdges(edges);
        const gridNodes = computeGridLayout(nodes, edges);
        setNodes(applyLayout(nodes, gridNodes));
        setLayoutLoading(false);
        worker.terminate();
      };
      worker.postMessage({ model });

      return () => {
        setLayoutLoading(false);
        worker.terminate();
      };
    }

    const runPreprocessAndLayout = async () => {
      const { preprocessArchitecture } = await import("../lib/preprocess");
      const preprocessed = preprocessArchitecture(model);
      preprocessedRef.current = preprocessed;

      const { nodes, edges } = modelToFlow(model, expandedClusterIds, preprocessed);
      setNodes(nodes);
      setEdges(edges);

      const cacheKey = getLayoutCacheKey(model, expansionPath);
      const cachedLayout = getCachedLayout(cacheKey);
      if (cachedLayout) {
        setNodes(applyElkLayout(nodes, cachedLayout));
        return;
      }

      setLayoutLoading(true);
      const elkWorker = new Worker(new URL("../lib/elk/layoutWorker.ts", import.meta.url), { type: "module" });
      elkWorker.onmessage = (event: MessageEvent<{ layout?: ElkNode; error?: string }>) => {
        if (event.data.layout) {
          setCachedLayout(cacheKey, event.data.layout);
          setNodes(applyElkLayout(nodes, event.data.layout));
        } else {
          setNodes(nodes);
        }
        setLayoutLoading(false);
        elkWorker.terminate();
      };
      elkWorker.onerror = () => {
        setNodes(nodes);
        setLayoutLoading(false);
        elkWorker.terminate();
      };
      elkWorker.postMessage({
        graph: flowToElkGraph(nodes, edges, preprocessed.elkHints),
        elkHints: preprocessed.elkHints
      });

      return () => {
        setLayoutLoading(false);
        elkWorker.terminate();
      };
    };

    const timer = setTimeout(runPreprocessAndLayout, 10);
    return () => clearTimeout(timer);
  }, [expandedClusterIds, expansionPath, model, setEdges, setNodes, setLayoutLoading]);
}
