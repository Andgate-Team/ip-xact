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
      "elk.edgeRouting": "ORTHOGONAL",
      // Prefer deterministic port ordering and routing when ports are present.
      "org.eclipse.elk.portConstraints": "FIXED_ORDER"
    },
    children: nodes.map((node) => {
      const isCluster = node.data.kind === "cluster";

      // Only component nodes have ports in the current model.
      const ports = !isCluster && node.data.kind === "component"
        ? node.data.component.ports.map((port) => {
            const id = `port:${node.id}:${port.id}`;
            const side = port.direction === "out" ? "RIGHT" : "LEFT";
            return { id, side };
          })
        : [];


      return {
        id: node.id,
        width: isCluster ? CLUSTER_NODE_WIDTH : COLLAPSED_NODE_WIDTH,
        height: isCluster ? CLUSTER_NODE_HEIGHT : COLLAPSED_NODE_HEIGHT,
        ...(ports.length ? { ports } : {}),
        ...(node.data.kind === "component" ? { portConstraints: "FIXED_ORDER" } : {})
      };
    }),
    edges: edges.map((edge): ElkExtendedEdge => {
      const connection = edge.data?.connection;
      const sourcePort = connection?.sourcePortId;
      const targetPort = connection?.targetPortId;

      return {
        id: edge.id,
        sources: [
          {
            id: edge.source,
            port: `port:${edge.source}:${sourcePort ?? ""}`
          }
        ],
        targets: [
          {
            id: edge.target,
            port: `port:${edge.target}:${targetPort ?? ""}`
          }
        ]
      } as any;
    })
  };
}
