import { create } from "zustand";
import type { Viewport } from "reactflow";
import type { ArchitectureFlowEdge, ArchitectureFlowNode } from "../types";

interface GraphStore {
  nodes: ArchitectureFlowNode[];
  edges: ArchitectureFlowEdge[];
  viewport: Viewport;
  expandedClusterIds: Set<string>;
  setNodes: (nodes: ArchitectureFlowNode[]) => void;
  setEdges: (edges: ArchitectureFlowEdge[]) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  setViewport: (viewport: Viewport) => void;
  toggleCluster: (clusterId: string) => void;
  expandClusterForComponent: (componentId: string) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  expandedClusterIds: new Set<string>(),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  updateNodePosition: (nodeId, position) =>
    set((state) => ({
      nodes: state.nodes.map((node) => (node.id === nodeId ? { ...node, position } : node))
    })),
  setViewport: (viewport) => set({ viewport }),
  toggleCluster: (clusterId) =>
    set((state) => {
      const expandedClusterIds = new Set(state.expandedClusterIds);
      if (expandedClusterIds.has(clusterId)) {
        expandedClusterIds.delete(clusterId);
      } else {
        expandedClusterIds.add(clusterId);
      }
      return { expandedClusterIds };
    }),
  expandClusterForComponent: (componentId) =>
    set((state) => {
      const clusterNode = state.nodes.find((node) => {
        return node.data.kind === "cluster" && node.data.cluster.componentIds.includes(componentId);
      });

      if (!clusterNode || state.expandedClusterIds.has(clusterNode.id)) {
        return {};
      }

      const expandedClusterIds = new Set(state.expandedClusterIds);
      expandedClusterIds.add(clusterNode.id);
      return { expandedClusterIds };
    })
}));
