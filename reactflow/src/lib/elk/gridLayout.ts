import type { ArchitectureFlowNode, ArchitectureFlowEdge } from "../../types";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 88;
const NODE_X_SPACING = 280;
const NODE_Y_SPACING = 130;
const BUS_CHANNEL_WIDTH = 32;
const BUS_CHANNEL_HEIGHT = 400;
const CLUSTER_WIDTH = 280;
const CLUSTER_HEIGHT = 118;

const LAYER_X: Record<number, number> = {
  0: 0,
  1: 300,
  2: 600,
  3: 900,
  4: 1200,
  5: 1500,
  6: 1800
};

export function computeGridLayout(
  nodes: ArchitectureFlowNode[],
  edges: ArchitectureFlowEdge[]
): ArchitectureFlowNode[] {
  const layerGroups = new Map<number, ArchitectureFlowNode[]>();

  for (const node of nodes) {
    let layer = 3;
    if (node.data.kind === "component") {
      layer = node.data.layer ?? 3;
    } else if (node.data.kind === "busChannel") {
      layer = node.data.layer ?? 1;
    } else if (node.data.kind === "cluster") {
      layer = 4;
    }

    const existing = layerGroups.get(layer);
    if (existing) {
      existing.push(node);
    } else {
      layerGroups.set(layer, [node]);
    }
  }

  const result: ArchitectureFlowNode[] = [];

  for (const [layer, layerNodes] of layerGroups) {
    const x = LAYER_X[layer] ?? layer * 300;
    const totalHeight = layerNodes.length * NODE_Y_SPACING;
    const startY = -(totalHeight / 2);

    for (let i = 0; i < layerNodes.length; i++) {
      const node = layerNodes[i];
      if (!node) continue;

      const y = startY + i * NODE_Y_SPACING;

      let width = NODE_WIDTH;
      let height = NODE_HEIGHT;

      if (node.data.kind === "busChannel") {
        width = BUS_CHANNEL_WIDTH;
        height = BUS_CHANNEL_HEIGHT;
      } else if (node.data.kind === "cluster") {
        width = CLUSTER_WIDTH;
        height = CLUSTER_HEIGHT;
      }

      result.push({
        ...node,
        position: { x: x - width / 2, y }
      });
    }
  }

  return result;
}
