import type { Connection } from "../../types";
import type { ConnectionMetadata, ELKLayoutHints, LayoutLayer, PortSide } from "./types";

export function optimizeEdges(
  connections: Connection[],
  connectionMetadata: Map<string, ConnectionMetadata>,
  portSides: Record<string, Record<string, PortSide>>,
  layerConstraints: Record<string, LayoutLayer>,
  groupHints: ELKLayoutHints["groupHints"]
): ELKLayoutHints {
  const portConstraints: Record<string, Record<string, PortSide>> = {};

  for (const conn of connections) {
    const meta = connectionMetadata.get(conn.id);
    if (!meta) continue;

    if (!portConstraints[conn.sourceComponentId]) {
      portConstraints[conn.sourceComponentId] = {};
    }
    if (!portConstraints[conn.targetComponentId]) {
      portConstraints[conn.targetComponentId] = {};
    }

    portConstraints[conn.sourceComponentId]![conn.sourcePortId] = meta.sourcePortSide;
    portConstraints[conn.targetComponentId]![conn.targetPortId] = meta.targetPortSide;
  }

  const mergedPortConstraints: Record<string, Record<string, PortSide>> = {};
  for (const compId of Object.keys(portSides)) {
    mergedPortConstraints[compId] = { ...portSides[compId] };
  }
  for (const compId of Object.keys(portConstraints)) {
    if (!mergedPortConstraints[compId]) {
      mergedPortConstraints[compId] = {};
    }
    Object.assign(mergedPortConstraints[compId], portConstraints[compId]);
  }

  return {
    layerConstraints,
    portConstraints: mergedPortConstraints,
    groupHints,
    elkOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "64",
      "elk.spacing.edgeEdge": "20",
      "elk.spacing.edgeNode": "28",
      "elk.layered.spacing.nodeNodeBetweenLayers": "110",
      "elk.layered.nodePlacement.strategy": "INTERACTIVE",
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
    }
  };
}
