import { MarkerType } from "reactflow";
import type {
  ArchitectureCluster,
  ArchitectureEdgeData,
  ArchitectureFlowEdge,
  ArchitectureFlowNode,
  ArchitectureModel,
  Component,
  ComponentType,
  Connection
} from "../../types";

const NODE_X_SPACING = 320;
const NODE_Y_SPACING = 220;
const MIN_COLUMNS = 3;
const MAX_COLUMNS = 64;
const CLUSTER_THRESHOLD = 220;
const MAX_VISIBLE_ANCHORS = 120;
const MAX_CLUSTER_SIZE = 80;
const ANCHOR_TYPES = new Set<ComponentType>(["cpu", "bus", "memory", "clockReset"]);

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

function getAnchorIds(model: ArchitectureModel, degree: Map<string, number>): Set<string> {
  const anchors = new Set(
    model.components.filter((component) => ANCHOR_TYPES.has(component.type)).map((component) => component.id)
  );

  const ranked = [...model.components].sort((left, right) => (degree.get(right.id) ?? 0) - (degree.get(left.id) ?? 0));

  for (const component of ranked) {
    if (anchors.size >= MAX_VISIBLE_ANCHORS) {
      break;
    }

    if ((degree.get(component.id) ?? 0) > 0) {
      anchors.add(component.id);
    }
  }

  return anchors;
}

function getPrimaryAnchorId(componentId: string, connections: Connection[], anchors: Set<string>, degree: Map<string, number>): string {
  const candidates = new Set<string>();

  for (const connection of connections) {
    if (connection.sourceComponentId === componentId && anchors.has(connection.targetComponentId)) {
      candidates.add(connection.targetComponentId);
    }
    if (connection.targetComponentId === componentId && anchors.has(connection.sourceComponentId)) {
      candidates.add(connection.sourceComponentId);
    }
  }

  if (candidates.size === 0) {
    return "unconnected";
  }

  return [...candidates].sort((left, right) => (degree.get(right) ?? 0) - (degree.get(left) ?? 0))[0] ?? "unconnected";
}

function makeClusterId(type: ComponentType, anchorId: string, bucketIndex: number): string {
  return `cluster:${type}:${anchorId}:${bucketIndex}`;
}

function makeClusterName(type: ComponentType, anchorId: string, componentById: Map<string, Component>): string {
  const anchorName = componentById.get(anchorId)?.name;
  const typeLabel = type === "clockReset" ? "clock/reset" : type;
  return anchorName ? `${typeLabel} near ${anchorName}` : `${typeLabel} group`;
}

function buildComponentClusterMap(
  model: ArchitectureModel,
  visibleComponentIds: Set<string>,
  expandedClusterIds: Set<string>,
  degree: Map<string, number>
): {
  componentToVisibleId: Map<string, string>;
  clusters: ArchitectureCluster[];
  expandedComponentIds: Set<string>;
} {
  const componentById = new Map(model.components.map((component) => [component.id, component]));
  const grouped = new Map<string, Component[]>();

  for (const component of model.components) {
    if (visibleComponentIds.has(component.id)) {
      continue;
    }

    const anchorId = getPrimaryAnchorId(component.id, model.connections, visibleComponentIds, degree);
    const key = `${component.type}:${anchorId}`;
    grouped.set(key, [...(grouped.get(key) ?? []), component]);
  }

  const componentToVisibleId = new Map<string, string>();
  const clusters: ArchitectureCluster[] = [];
  const expandedComponentIds = new Set<string>();

  for (const component of model.components) {
    if (visibleComponentIds.has(component.id)) {
      componentToVisibleId.set(component.id, component.id);
    }
  }

  for (const [key, components] of grouped) {
    const [type, anchorId] = key.split(":") as [ComponentType, string];
    const ordered = [...components].sort((left, right) => (degree.get(right.id) ?? 0) - (degree.get(left.id) ?? 0));

    for (let start = 0; start < ordered.length; start += MAX_CLUSTER_SIZE) {
      const bucket = ordered.slice(start, start + MAX_CLUSTER_SIZE);
      const clusterId = makeClusterId(type, anchorId, Math.floor(start / MAX_CLUSTER_SIZE));
      const expanded = expandedClusterIds.has(clusterId);

      if (expanded) {
        for (const component of bucket) {
          componentToVisibleId.set(component.id, component.id);
          expandedComponentIds.add(component.id);
        }
        continue;
      }

      const componentIds = bucket.map((component) => component.id);
      const componentIdSet = new Set(componentIds);
      const connectionCount = model.connections.filter(
        (connection) => componentIdSet.has(connection.sourceComponentId) || componentIdSet.has(connection.targetComponentId)
      ).length;

      clusters.push({
        id: clusterId,
        name: makeClusterName(type, anchorId, componentById),
        type,
        componentIds,
        componentCount: bucket.length,
        connectionCount,
        expanded
      });

      for (const component of bucket) {
        componentToVisibleId.set(component.id, clusterId);
      }
    }
  }

  return { componentToVisibleId, clusters, expandedComponentIds };
}

function makeNode(component: Component, index: number, columnCount: number): ArchitectureFlowNode {
  return {
    id: component.id,
    type: "architecture",
    position: { x: (index % columnCount) * NODE_X_SPACING, y: Math.floor(index / columnCount) * NODE_Y_SPACING },
    data: { kind: "component", component }
  };
}

function makeClusterNode(cluster: ArchitectureCluster, index: number, columnCount: number): ArchitectureFlowNode {
  return {
    id: cluster.id,
    type: "architecture",
    position: { x: (index % columnCount) * NODE_X_SPACING, y: Math.floor(index / columnCount) * NODE_Y_SPACING },
    data: { kind: "cluster", cluster }
  };
}

function aggregateEdges(model: ArchitectureModel, componentToVisibleId: Map<string, string>): ArchitectureFlowEdge[] {
  // Key must preserve which ports are connected, otherwise we can’t reference ports in ELK.
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
      // Connect to the correct per-port handles.
      sourceHandle: `port:${source}:${connection.sourcePortId}`,
      targetHandle: `port:${target}:${connection.targetPortId}`,
      type: "architecture",
      data,
      markerEnd: { type: MarkerType.ArrowClosed }
    };
  });
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
  const shouldCluster = model.components.length > CLUSTER_THRESHOLD;
  const anchorIds = shouldCluster ? getAnchorIds(model, degree) : new Set(model.components.map((component) => component.id));
  const { componentToVisibleId, clusters, expandedComponentIds } = buildComponentClusterMap(
    model,
    anchorIds,
    expandedClusterIds ?? new Set<string>(),
    degree
  );
  const visibleComponents = model.components.filter((component) => anchorIds.has(component.id) || expandedComponentIds.has(component.id));
  const totalNodeCount = visibleComponents.length + clusters.length;
  const columnCount = getFallbackColumnCount(totalNodeCount);

  const nodes = [
    ...visibleComponents.map((component, index) => makeNode(component, index, columnCount)),
    ...clusters.map((cluster, index) => makeClusterNode(cluster, visibleComponents.length + index, columnCount))
  ];

  const edges = aggregateEdges(model, componentToVisibleId);

  return { nodes, edges };
}
