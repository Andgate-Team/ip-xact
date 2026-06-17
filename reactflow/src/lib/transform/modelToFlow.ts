import { MarkerType } from "reactflow";
import type {
  ArchitectureCluster,
  ArchitectureEdgeData,
  ArchitectureFlowEdge,
  ArchitectureFlowNode,
  ArchitectureModel,
  Component,
  ComponentType,
  Connection,
  HierarchyNode
} from "../../types";
import { buildHierarchy, findHierarchyNode, getDescendantIds } from "../clustering/hierarchyBuilder";

const NODE_X_SPACING = 320;
const NODE_Y_SPACING = 220;
const MIN_COLUMNS = 3;
const MAX_COLUMNS = 64;

function getFallbackColumnCount(nodeCount: number): number {
  if (nodeCount <= MIN_COLUMNS) {
    return Math.max(nodeCount, 1);
  }

  return Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, Math.ceil(Math.sqrt(nodeCount * 1.6))));
}

function getDegreeMap(model: ArchitectureModel): Map<string, number> {
  const degree = new Map(model.components.map((component) => [component.id, 0]));

  for (const connection of model.connections) {
    degree.set(connection.sourceComponentId, (degree.get(connection.sourceComponentId) ?? 0) + 1);
    degree.set(connection.targetComponentId, (degree.get(connection.targetComponentId) ?? 0) + 1);
  }

  return degree;
}

function makeNode(component: Component, index: number, columnCount: number): ArchitectureFlowNode {
  return {
    id: component.id,
    type: "architecture",
    position: { x: (index % columnCount) * NODE_X_SPACING, y: Math.floor(index / columnCount) * NODE_Y_SPACING },
    data: { kind: "component", component }
  };
}

function makeClusterNode(
  cluster: ArchitectureCluster,
  index: number,
  columnCount: number
): ArchitectureFlowNode {
  return {
    id: cluster.id,
    type: "architecture",
    position: { x: (index % columnCount) * NODE_X_SPACING, y: Math.floor(index / columnCount) * NODE_Y_SPACING },
    data: { kind: "cluster", cluster }
  };
}

function aggregateEdges(model: ArchitectureModel, componentToVisibleId: Map<string, string>): ArchitectureFlowEdge[] {
  const edgeByPortPair = new Map<
    string,
    { connection: Connection; count: number; source: string; target: string; sourcePortId: string; targetPortId: string }
  >();

  for (const connection of model.connections) {
    const source = componentToVisibleId.get(connection.sourceComponentId);
    const target = componentToVisibleId.get(connection.targetComponentId);

    if (!source || !target || source === target) {
      continue;
    }

    const key = `${source}->${target}:${connection.sourcePortId}->${connection.targetPortId}`;
    const existing = edgeByPortPair.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      edgeByPortPair.set(key, {
        connection,
        count: 1,
        source,
        target,
        sourcePortId: connection.sourcePortId,
        targetPortId: connection.targetPortId
      });
    }
  }

  return [...edgeByPortPair.values()].map(({ connection, count, source, target }): ArchitectureFlowEdge => {
    const data: ArchitectureEdgeData = { connection, connectionCount: count };
    return {
      id: count > 1
        ? `agg_${source}_to_${target}:${connection.sourcePortId}_to_${connection.targetPortId}`
        : connection.id,
      source,
      target,
      sourceHandle: `port:${source}:${connection.sourcePortId}`,
      targetHandle: `port:${target}:${connection.targetPortId}`,
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
      const result = walkHierarchy(child, expandedClusterIds, model, componentById, componentToVisibleId);
      visibleComponents.push(...result.visibleComponents);
      clusters.push(...result.clusters);
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

    const cluster: ArchitectureCluster = {
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
    };

    clusters.push(cluster);

    for (const compId of node.componentIds) {
      componentToVisibleId.set(compId, node.id);
    }
  }

  return { visibleComponents, clusters };
}

export function modelToFlow(model: ArchitectureModel, expandedClusterIds?: Set<string>): {
  nodes: ArchitectureFlowNode[];
  edges: ArchitectureFlowEdge[];
};
export function modelToFlow(
  model: ArchitectureModel,
  expandedClusterIds?: Set<string>
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

  const totalNodeCount = visibleComponents.length + clusters.length;
  const columnCount = getFallbackColumnCount(totalNodeCount);

  const nodes = [
    ...visibleComponents.map((component, index) => makeNode(component, index, columnCount)),
    ...clusters.map((cluster, index) => makeClusterNode(cluster, visibleComponents.length + index, columnCount))
  ];

  const edges = aggregateEdges(model, componentToVisibleId);

  return { nodes, edges };
}
