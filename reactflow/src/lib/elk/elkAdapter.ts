import type { ElkExtendedEdge, ElkNode } from "elkjs";
import type { ArchitectureFlowEdge, ArchitectureFlowNode } from "../../types";
import type { ELKLayoutHints } from "../preprocess/types";

const COLLAPSED_NODE_WIDTH = 220;
const COLLAPSED_NODE_HEIGHT = 88;
const CLUSTER_NODE_WIDTH = 280;
const CLUSTER_NODE_HEIGHT = 118;
const BUS_CHANNEL_WIDTH = 32;
const BUS_CHANNEL_HEIGHT = 720;

export function flowToElkGraph(
  nodes: ArchitectureFlowNode[],
  edges: ArchitectureFlowEdge[],
  elkHints?: ELKLayoutHints
): ElkNode {
  const nodeCount = nodes.length;
  const placementStrategy = nodeCount > 500 ? "NETWORK_SIMPLEX" : "INTERACTIVE";

  const baseOptions: Record<string, string> = {
    "elk.algorithm": "layered",
    "elk.direction": "RIGHT",
    "elk.spacing.nodeNode": "48",
    "elk.spacing.edgeEdge": "16",
    "elk.spacing.edgeNode": "24",
    "elk.layered.spacing.nodeNodeBetweenLayers": "80",
    "elk.layered.nodePlacement.strategy": placementStrategy,
    "elk.layered.nodePlacement.bk.edgeStraightening": "true",
    "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
    "elk.layered.crossingMinimization.greedySwitch": "true",
    "elk.layered.crossingMinimization.iterations": "30",
    "elk.layered.mergeEdges": "true",
    "elk.layered.mergeNodes": "true",
    "elk.layered.wrapping.strategy": "OFF",
    "elk.layered.nodeLayering": "NETWORK_SIMPLEX",
    "elk.edgeRouting": "ORTHOGONAL",
    "org.eclipse.elk.portConstraints": "FIXED_ORDER"
  };

  if (elkHints?.elkOptions) {
    Object.assign(baseOptions, elkHints.elkOptions);
  }

  return {
    id: "root",
    layoutOptions: baseOptions,
    children: nodes.map((node) => {
      const isBusChannel = node.data.kind === "busChannel";
      const isCluster = node.data.kind === "cluster";

      let width = COLLAPSED_NODE_WIDTH;
      let height = COLLAPSED_NODE_HEIGHT;

      if (isBusChannel) {
        width = BUS_CHANNEL_WIDTH;
        height = BUS_CHANNEL_HEIGHT;
      } else if (isCluster) {
        width = CLUSTER_NODE_WIDTH;
        height = CLUSTER_NODE_HEIGHT;
      }

      const ports = [];

      if (!isCluster) {
        ports.push(
          { id: `left:${node.id}`, side: "LEFT" as const, x: 0, y: height / 2 },
          { id: `right:${node.id}`, side: "RIGHT" as const, x: width, y: height / 2 }
        );
      }

      return {
        id: node.id,
        width,
        height,
        ...(ports.length ? { ports } : {})
      };
    }),
    edges: edges.map((edge): ElkExtendedEdge => {
      return {
        id: edge.id,
        sources: [{ id: edge.source, port: `right:${edge.source}` }],
        targets: [{ id: edge.target, port: `left:${edge.target}` }]
      } as any;
    })
  };
}
