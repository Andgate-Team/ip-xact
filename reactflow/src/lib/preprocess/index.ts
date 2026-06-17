import type { ArchitectureModel, Component, Connection } from "../../types";
import type {
  ComponentMetadata,
  ConnectionMetadata,
  ELKLayoutHints,
  LayoutLayer,
  SemanticGroup
} from "./types";
import { classifyComponents } from "./classifier";
import { detectGroups } from "./groupDetector";
import { analyzeConnections } from "./connectionAnalyzer";
import { assignPortSides } from "./portAssigner";
import { optimizeEdges } from "./edgeOptimizer";

export interface PreprocessedArchitecture {
  model: ArchitectureModel;
  componentMetadata: Map<string, ComponentMetadata>;
  connectionMetadata: Map<string, ConnectionMetadata>;
  groups: SemanticGroup[];
  portSides: Record<string, Record<string, string>>;
  elkHints: ELKLayoutHints;
}

function buildPortNameMap(components: Component[]): Map<string, Map<string, string>> {
  const result = new Map<string, Map<string, string>>();
  for (const comp of components) {
    const portMap = new Map<string, string>();
    for (const port of comp.ports) {
      portMap.set(port.id, port.name);
    }
    result.set(comp.id, portMap);
  }
  return result;
}

export function preprocessArchitecture(model: ArchitectureModel): PreprocessedArchitecture {
  const componentMetadata = classifyComponents(model.components, model.connections);
  const groups = detectGroups(model.components, componentMetadata);

  for (const group of groups) {
    for (const compId of group.componentIds) {
      const meta = componentMetadata.get(compId);
      if (meta) {
        meta.groupId = group.id;
      }
    }
  }

  const portNameMap = buildPortNameMap(model.components);
  const connectionMetadata = analyzeConnections(model.connections, componentMetadata, portNameMap);
  const portSides = assignPortSides(model.components, componentMetadata);

  const layerConstraints: Record<string, LayoutLayer> = {};
  for (const [compId, meta] of componentMetadata) {
    layerConstraints[compId] = meta.layer;
  }

  const groupHints: ELKLayoutHints["groupHints"] = groups.map((g) => ({
    id: g.id,
    children: g.componentIds
  }));

  const elkHints = optimizeEdges(
    model.connections,
    connectionMetadata,
    portSides,
    layerConstraints,
    groupHints
  );

  return {
    model,
    componentMetadata,
    connectionMetadata,
    groups,
    portSides,
    elkHints
  };
}
