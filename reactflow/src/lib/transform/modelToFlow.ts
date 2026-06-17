import { MarkerType } from "reactflow";
import type {
  ArchitectureCluster,
  ArchitectureEdgeData,
  ArchitectureFlowEdge,
  ArchitectureFlowNode,
  ArchitectureModel,
  ArchitectureNodeData,
  BusChannelNodeData,
  Component,
  ComponentType,
  Connection,
  HierarchyNode
} from "../../types";
import type { LayoutLayer } from "../preprocess/types";
import type { PreprocessedArchitecture } from "../preprocess";
import { buildHierarchy, findHierarchyNode, getDescendantIds } from "../clustering/hierarchyBuilder";

const NODE_X_SPACING = 260;
const NODE_Y_SPACING = 120;
const NODE_HEIGHT = 88;
const BUS_CHANNEL_HEIGHT = 720;
const BUS_CHANNEL_WIDTH = 32;
const NODE_WIDTH = 220;
const CLUSTER_WIDTH = 280;
const EXPAND_THRESHOLD = 6;
const MIN_COLUMNS = 3;
const MAX_COLUMNS = 32;

const LAYER_X: Record<number, number> = {
  0: 0,
  1: 300,
  2: 600,
  3: 900,
  4: 1200,
  5: 1500,
  6: 1800
};

function getFallbackColumnCount(nodeCount: number): number {
  if (nodeCount <= MIN_COLUMNS) {
    return Math.max(nodeCount, 1);
  }
  return Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, Math.ceil(Math.sqrt(nodeCount * 1.2))));
}

function getDegreeMap(model: ArchitectureModel): Map<string, number> {
  const degree = new Map(model.components.map((component) => [component.id, 0]));
  for (const connection of model.connections) {
    degree.set(connection.sourceComponentId, (degree.get(connection.sourceComponentId) ?? 0) + 1);
    degree.set(connection.targetComponentId, (degree.get(connection.targetComponentId) ?? 0) + 1);
  }
  return degree;
}

function isBusType(type: ComponentType): boolean {
  return type === "bus";
}

function makeBusChannelNode(
  component: Component,
  layer: LayoutLayer,
  x: number,
  y: number
): ArchitectureFlowNode {
  return {
    id: component.id,
    type: "busChannel",
    position: { x, y },
    data: {
      kind: "busChannel",
      component,
      layer
    } as BusChannelNodeData
  };
}

function makeComponentNode(
  component: Component,
  layer: LayoutLayer | undefined,
  x: number,
  y: number
): ArchitectureFlowNode {
  return {
    id: component.id,
    type: "architecture",
    position: { x, y },
    data: {
      kind: "component",
      component,
      layer
    }
  };
}

function makeClusterNode(
  cluster: ArchitectureCluster,
  x: number,
  y: number
): ArchitectureFlowNode {
  return {
    id: cluster.id,
    type: "architecture",
    position: { x, y },
    data: { kind: "cluster", cluster }
  };
}

function aggregateEdges(
  model: ArchitectureModel,
  componentToVisibleId: Map<string, string>,
  connectionMetadata?: Map<string, { connectionType: string }>
): ArchitectureFlowEdge[] {
  const edgeByKey = new Map<
    string,
    { connection: Connection; count: number; source: string; target: string }
  >();

  for (const connection of model.connections) {
    const source = componentToVisibleId.get(connection.sourceComponentId);
    const target = componentToVisibleId.get(connection.targetComponentId);

    if (!source || !target || source === target) {
      continue;
    }

    const key = `${source}->${target}`;
    const existing = edgeByKey.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      edgeByKey.set(key, {
        connection,
        count: 1,
        source,
        target
      });
    }
  }

  return [...edgeByKey.values()].map(({ connection, count, source, target }): ArchitectureFlowEdge => {
    const connMeta = connectionMetadata?.get(connection.id);
    const data: ArchitectureEdgeData = {
      connection,
      connectionCount: count,
      connectionType: connMeta?.connectionType as ArchitectureEdgeData["connectionType"]
    };
    return {
      id: count > 1 ? `agg_${source}_to_${target}` : connection.id,
      source,
      target,
      type: "architecture",
      data,
      markerEnd: { type: MarkerType.ArrowClosed }
    };
  });
}

function walkHierarchy(
  node: HierarchyNode,
  expandedClusterIds: Set<string>,
  model: ArchitectureModel,
  componentById: Map<string, Component>,
  componentToVisibleId: Map<string, string>
): { visibleComponents: Component[]; clusters: ArchitectureCluster[] } {
  const visibleComponents: Component[] = [];
  const clusters: ArchitectureCluster[] = [];

  if (node.childGroups.length === 0) {
    for (const compId of node.componentIds) {
      const comp = componentById.get(compId);
      if (comp) {
        visibleComponents.push(comp);
        componentToVisibleId.set(compId, compId);
      }
    }
    return { visibleComponents, clusters };
  }

  const isExpanded = expandedClusterIds.has(node.id);

  if (isExpanded) {
    for (const child of node.childGroups) {
      const childCompCount = child.componentIds.length;
      const childHasGrandChildren = child.childGroups.length > 0;

      if (childCompCount <= EXPAND_THRESHOLD || !childHasGrandChildren) {
        for (const compId of child.componentIds) {
          const comp = componentById.get(compId);
          if (comp) {
            visibleComponents.push(comp);
            componentToVisibleId.set(compId, compId);
          }
        }
      } else {
        const connectionCount = model.connections.filter(
          (conn) =>
            child.componentIds.includes(conn.sourceComponentId) ||
            child.componentIds.includes(conn.targetComponentId)
        ).length;

        const typeBreakdown: Partial<Record<ComponentType, number>> = {};
        for (const compId of child.componentIds) {
          const comp = componentById.get(compId);
          if (comp) {
            typeBreakdown[comp.type] = (typeBreakdown[comp.type] ?? 0) + 1;
          }
        }

        clusters.push({
          id: child.id,
          name: child.name,
          type: child.type === "group" ? "custom" : child.type,
          componentIds: child.componentIds,
          componentCount: child.componentIds.length,
          connectionCount,
          expanded: false,
          hierarchyPath: child.id.replace("hierarchy:", "").split(":"),
          depth: child.depth,
          typeBreakdown
        });

        for (const compId of child.componentIds) {
          componentToVisibleId.set(compId, child.id);
        }
      }
    }
  } else {
    const connectionCount = model.connections.filter(
      (conn) =>
        node.componentIds.includes(conn.sourceComponentId) ||
        node.componentIds.includes(conn.targetComponentId)
    ).length;

    const typeBreakdown: Partial<Record<ComponentType, number>> = {};
    for (const compId of node.componentIds) {
      const comp = componentById.get(compId);
      if (comp) {
        typeBreakdown[comp.type] = (typeBreakdown[comp.type] ?? 0) + 1;
      }
    }

    clusters.push({
      id: node.id,
      name: node.name,
      type: node.type === "group" ? "custom" : node.type,
      componentIds: node.componentIds,
      componentCount: node.componentIds.length,
      connectionCount,
      expanded: false,
      hierarchyPath: node.id.replace("hierarchy:", "").split(":"),
      depth: node.depth,
      typeBreakdown
    });

    for (const compId of node.componentIds) {
      componentToVisibleId.set(compId, node.id);
    }
  }

  return { visibleComponents, clusters };
}

function layoutWithLayers(
  components: Component[],
  clusters: ArchitectureCluster[],
  preprocessed?: PreprocessedArchitecture
): ArchitectureFlowNode[] {
  const nodes: ArchitectureFlowNode[] = [];

  const buses: Array<{ component: Component; layer: LayoutLayer }> = [];
  const nonBuses: Array<{ component: Component; layer: LayoutLayer }> = [];

  for (const comp of components) {
    const meta = preprocessed?.componentMetadata.get(comp.id);
    const layer = (meta?.layer ?? 3) as LayoutLayer;
    if (isBusType(comp.type)) {
      buses.push({ component: comp, layer });
    } else {
      nonBuses.push({ component: comp, layer });
    }
  }

  const layerGroups = new Map<number, Array<{ component: Component; layer: LayoutLayer }>>();
  for (const item of nonBuses) {
    const existing = layerGroups.get(item.layer);
    if (existing) {
      existing.push(item);
    } else {
      layerGroups.set(item.layer, [item]);
    }
  }

  const sortedLayers = [...layerGroups.keys()].sort((a, b) => a - b);

  for (const layer of sortedLayers) {
    const items = layerGroups.get(layer)!;
    const x = LAYER_X[layer] ?? layer * 300;
    const totalHeight = items.length * NODE_Y_SPACING;
    const startY = -(totalHeight / 2) + (NODE_HEIGHT / 2);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      const y = startY + i * NODE_Y_SPACING;
      nodes.push(makeComponentNode(item.component, item.layer, x, y));
    }
  }

  const busLayers = new Map<number, Array<{ component: Component; layer: LayoutLayer }>>();
  for (const item of buses) {
    const existing = busLayers.get(item.layer);
    if (existing) {
      existing.push(item);
    } else {
      busLayers.set(item.layer, [item]);
    }
  }

  for (const [layer, busItems] of busLayers) {
    const x = LAYER_X[layer] ?? layer * 300;
    const totalBusHeight = busItems.length * (BUS_CHANNEL_HEIGHT + 40);
    const startY = -(totalBusHeight / 2) + (BUS_CHANNEL_HEIGHT / 2);

    for (let i = 0; i < busItems.length; i++) {
      const item = busItems[i];
      if (!item) continue;
      const y = startY + i * (BUS_CHANNEL_HEIGHT + 40);
      nodes.push(makeBusChannelNode(item.component, item.layer, x, y));
    }
  }

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    if (!cluster) continue;
    const clusterX = LAYER_X[4] ?? 1200;
    const clusterY = -200 + i * (CLUSTER_WIDTH + 40);
    nodes.push(makeClusterNode(cluster, clusterX + 400, clusterY));
  }

  return nodes;
}

export function modelToFlow(
  model: ArchitectureModel,
  expandedClusterIds?: Set<string>,
  preprocessed?: PreprocessedArchitecture
): {
  nodes: ArchitectureFlowNode[];
  edges: ArchitectureFlowEdge[];
} {
  const degree = getDegreeMap(model);
  const hierarchy = buildHierarchy(model, degree);
  const componentById = new Map(model.components.map((component) => [component.id, component]));
  const expandedSet = expandedClusterIds ?? new Set<string>();
  const componentToVisibleId = new Map<string, string>();

  const visibleComponents: Component[] = [];
  const clusters: ArchitectureCluster[] = [];

  for (const child of hierarchy.childGroups) {
    const result = walkHierarchy(child, expandedSet, model, componentById, componentToVisibleId);
    visibleComponents.push(...result.visibleComponents);
    clusters.push(...result.clusters);
  }

  const nodes = layoutWithLayers(visibleComponents, clusters, preprocessed);
  const edges = aggregateEdges(model, componentToVisibleId, preprocessed?.connectionMetadata);

  return { nodes, edges };
}
