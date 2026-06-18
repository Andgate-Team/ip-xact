import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs";
import type { ArchitectureModel } from "../../types";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 88;
const ELK_THRESHOLD = 2000;

const elk = new ELK();

export function fallbackGridPositions(model: ArchitectureModel): Record<string, { x: number; y: number }> {
  const GAP_X = 48;
  const GAP_Y = 48;
  const COLS = Math.ceil(Math.sqrt(model.components.length));

  const positions: Record<string, { x: number; y: number }> = {};
  model.components.forEach((component, index) => {
    const col = index % COLS;
    const row = Math.floor(index / COLS);
    positions[component.id] = {
      x: col * (NODE_WIDTH + GAP_X) + NODE_WIDTH / 2,
      y: row * (NODE_HEIGHT + GAP_Y) + NODE_HEIGHT / 2
    };
  });
  return positions;
}

async function elkLayout(model: ArchitectureModel): Promise<Record<string, { x: number; y: number }>> {
  const graph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "48",
      "elk.spacing.edgeEdge": "16",
      "elk.spacing.edgeNode": "24",
      "elk.layered.spacing.nodeNodeBetweenLayers": "80",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
      "elk.layered.nodePlacement.bk.edgeStraightening": "true",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.crossingMinimization.greedySwitch": "true",
      "elk.layered.crossingMinimization.iterations": "30",
      "elk.layered.mergeEdges": "true",
      "elk.layered.mergeNodes": "true",
      "elk.layered.wrapping.strategy": "OFF",
      "elk.layered.nodeLayering": "NETWORK_SIMPLEX",
      "elk.edgeRouting": "ORTHOGONAL"
    },
    children: model.components.map((component) => ({
      id: component.id,
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    })),
    edges: model.connections.map((connection) => ({
      id: connection.id,
      sources: [connection.sourceComponentId],
      targets: [connection.targetComponentId]
    }))
  };

  const layout = await elk.layout(graph);

  if (layout.children && layout.children.length === model.components.length) {
    const positions: Record<string, { x: number; y: number }> = {};
    for (const child of layout.children) {
      positions[child.id] = {
        x: (child.x ?? 0) + NODE_WIDTH / 2,
        y: (child.y ?? 0) + NODE_HEIGHT / 2
      };
    }
    return positions;
  }

  return fallbackGridPositions(model);
}

async function forceDirectedLayout(model: ArchitectureModel): Promise<Record<string, { x: number; y: number }>> {
  const { default: cytoscape } = await import("cytoscape");

  const cy = cytoscape({
    headless: true,
    elements: [
      ...model.components.map((c) => ({
        group: "nodes" as const,
        data: { id: c.id }
      })),
      ...model.connections.map((conn) => ({
        group: "edges" as const,
        data: { id: conn.id, source: conn.sourceComponentId, target: conn.targetComponentId }
      }))
    ]
  });

  await new Promise<void>((resolve) => {
    cy.layout({
      name: "cose",
      animate: false,
      nodeDimensionsIncludeLabels: false,
      randomize: true,
      componentSpacing: 100,
      nodeRepulsion: () => 8000,
      idealEdgeLength: () => 120,
      edgeElasticity: () => 100,
      nestingFactor: 1.2,
      gravity: 0.25,
      numIter: 2500,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
      padding: 50,
      ready: () => resolve(),
      stop: () => resolve()
    } as any).run();
  });

  const positions: Record<string, { x: number; y: number }> = {};
  cy.nodes().forEach((node) => {
    const pos = node.position();
    positions[node.id()] = { x: pos.x, y: pos.y };
  });

  cy.destroy();
  return positions;
}

export async function computeLayout(model: ArchitectureModel): Promise<Record<string, { x: number; y: number }>> {
  try {
    const useForceDirected = model.components.length >= ELK_THRESHOLD;
    console.log(
      `Layout: ${model.components.length} components → ${useForceDirected ? "force-directed (cose)" : "ELK (layered)"}`
    );
    return useForceDirected ? await forceDirectedLayout(model) : await elkLayout(model);
  } catch (error) {
    console.error("Layout error:", error);
    return fallbackGridPositions(model);
  }
}
