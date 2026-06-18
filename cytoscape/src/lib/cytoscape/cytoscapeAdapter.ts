import type { ArchitectureModel } from "../../types";
import type { CytoscapeElement, CytoscapeNodeElement, CytoscapeEdgeElement } from "../../types/cytoscapeElements";

export function cytoscapeAdapter(
  model: ArchitectureModel,
  positions?: Record<string, { x: number; y: number }>
): CytoscapeElement[] {
  const elements: CytoscapeElement[] = [];

  const portNameMap = new Map<string, string>();
  for (const component of model.components) {
    for (const port of component.ports) {
      portNameMap.set(port.id, port.name);
    }
  }

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
    const sourcePortName = portNameMap.get(connection.sourcePortId) ?? connection.sourcePortId;
    const targetPortName = portNameMap.get(connection.targetPortId) ?? connection.targetPortId;

    const edge: CytoscapeEdgeElement = {
      group: "edges",
      data: {
        id: connection.id,
        source: connection.sourceComponentId,
        target: connection.targetComponentId,
        sourcePortId: connection.sourcePortId,
        targetPortId: connection.targetPortId,
        label: `${sourcePortName} → ${targetPortName}`
      }
    };
    elements.push(edge);
  }

  return elements;
}
