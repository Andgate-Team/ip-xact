import type { ElkExtendedEdge, ElkNode } from "elkjs";
import type { ArchitectureFlowEdge, ArchitectureFlowNode } from "../../types";

const COLLAPSED_NODE_WIDTH = 220;
const COLLAPSED_NODE_HEIGHT = 88;
const CLUSTER_NODE_WIDTH = 280;
const CLUSTER_NODE_HEIGHT = 118;

export function flowToElkGraph(nodes: ArchitectureFlowNode[], edges: ArchitectureFlowEdge[]): ElkNode {
  return {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "48",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.layered.wrapping.strategy": "MULTI_EDGE",
      "elk.layered.wrapping.correctionFactor": "1.0",
      "elk.edgeRouting": "ORTHOGONAL"
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: node.data.kind === "cluster" ? CLUSTER_NODE_WIDTH : COLLAPSED_NODE_WIDTH,
      height: node.data.kind === "cluster" ? CLUSTER_NODE_HEIGHT : COLLAPSED_NODE_HEIGHT
    })),
    edges: edges.map(
      (edge): ElkExtendedEdge => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target]
      })
    )
  };
}
