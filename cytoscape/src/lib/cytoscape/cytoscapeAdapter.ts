import type { ArchitectureModel } from "../../types";
import type { CytoscapeElement, CytoscapeNodeElement, CytoscapeEdgeElement } from "../../types/cytoscapeElements";

export function cytoscapeAdapter(
  model: ArchitectureModel,
  positions?: Record<string, { x: number; y: number }>
): CytoscapeElement[] {
  const elements: CytoscapeElement[] = [];

  for (const component of model.components) {
    const node: CytoscapeNodeElement = {
      group: "nodes",
      data: {
        id: component.id,
        label: component.name,
        type: component.type
      }
    };

    if (positions && positions[component.id]) {
      node.position = positions[component.id];
    }

    elements.push(node);
  }

  for (const connection of model.connections) {
    const edge: CytoscapeEdgeElement = {
      group: "edges",
      data: {
        id: connection.id,
        source: connection.sourceComponentId,
        target: connection.targetComponentId,
        sourcePortId: connection.sourcePortId,
        targetPortId: connection.targetPortId,
        label: `${connection.sourcePortId} → ${connection.targetPortId}`
      }
    };
    elements.push(edge);
  }

  return elements;
}
