import type { ElkExtendedEdge, ElkNode } from "elkjs";
import type { ArchitectureFlowEdge, ArchitectureFlowNode } from "../../types";

const COLLAPSED_NODE_WIDTH = 220;
const COLLAPSED_NODE_HEIGHT = 88;
const CLUSTER_NODE_WIDTH = 280;
const CLUSTER_NODE_HEIGHT = 118;
const PORT_PADDING = 12;

function calculatePortY(
  ports: { id: string; direction: string }[],
  portId: string,
  side: "LEFT" | "RIGHT"
): number {
  const sidePorts = ports.filter((p) => {
    if (side === "LEFT") return p.direction === "in" || p.direction === "inout";
    return p.direction === "out" || p.direction === "inout";
  });

  const idx = sidePorts.findIndex((p) => p.id === portId);
  if (idx === -1) return COLLAPSED_NODE_HEIGHT / 2;

  const spacing = (COLLAPSED_NODE_HEIGHT - PORT_PADDING * 2) / Math.max(sidePorts.length - 1, 1);
  return sidePorts.length === 1
    ? COLLAPSED_NODE_HEIGHT / 2
    : PORT_PADDING + idx * spacing;
}

export function flowToElkGraph(nodes: ArchitectureFlowNode[], edges: ArchitectureFlowEdge[]): ElkNode {
  const nodeCount = nodes.length;
  const placementStrategy = nodeCount > 500 ? "NETWORK_SIMPLEX" : "INTERACTIVE";

  return {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "64",
      "elk.spacing.edgeEdge": "20",
      "elk.spacing.edgeNode": "28",
      "elk.layered.spacing.nodeNodeBetweenLayers": "110",
      "elk.layered.nodePlacement.strategy": placementStrategy,
      "elk.layered.nodePlacement.bk.edgeStraightening": "true",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.crossingMinimization.greedySwitch": "true",
      "elk.layered.crossingMinimization.iterations": "25",
      "elk.layered.mergeEdges": "true",
      "elk.layered.mergeNodes": "true",
      "elk.layered.wrapping.strategy": "OFF",
      "elk.layered.nodeLayering": "NETWORK_SIMPLEX",
      "elk.edgeRouting": "ORTHOGONAL",
      "org.eclipse.elk.portConstraints": "FIXED_ORDER"
    },
    children: nodes.map((node) => {
      const isCluster = node.data.kind === "cluster";

      const ports = !isCluster && node.data.kind === "component"
        ? node.data.component.ports.map((port) => {
            const id = `port:${node.id}:${port.id}`;
            const side = port.direction === "out" ? "RIGHT" : "LEFT";
            const allPorts = node.data.kind === "component" ? node.data.component.ports : [];
            const y = calculatePortY(allPorts, port.id, side);
            return {
              id,
              side,
              x: side === "LEFT" ? 0 : COLLAPSED_NODE_WIDTH,
              y
            };
          })
        : [];

      return {
        id: node.id,
        width: isCluster ? CLUSTER_NODE_WIDTH : COLLAPSED_NODE_WIDTH,
        height: isCluster ? CLUSTER_NODE_HEIGHT : COLLAPSED_NODE_HEIGHT,
        ...(ports.length ? { ports } : {})
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
