import type { ArchitectureModel, Component, ComponentType, Connection } from "../../types";
import type { HierarchyNode } from "../../types";

const HIERARCHY_CLUSTER_THRESHOLD = 12;
const MAX_SUBGROUP_SIZE = 20;

const TYPE_GROUP_ORDER: ComponentType[] = ["cpu", "bus", "memory", "peripheral", "interface", "clockReset", "custom"];

const TYPE_LABELS: Record<ComponentType, string> = {
  cpu: "CPU",
  bus: "Bus",
  memory: "Memory",
  peripheral: "Peripheral",
  interface: "Interface",
  clockReset: "Clock/Reset",
  custom: "Custom"
};

function computeTypeBreakdown(components: Component[]): Partial<Record<ComponentType, number>> {
  const breakdown: Partial<Record<ComponentType, number>> = {};
  for (const comp of components) {
    breakdown[comp.type] = (breakdown[comp.type] ?? 0) + 1;
  }
  return breakdown;
}

function computeConnectionCount(components: Component[], connections: Connection[]): number {
  const ids = new Set(components.map((c) => c.id));
  return connections.filter(
    (conn) => ids.has(conn.sourceComponentId) || ids.has(conn.targetComponentId)
  ).length;
}

function getPrimaryAnchorId(
  componentId: string,
  connections: Connection[],
  candidateIds: Set<string>,
  degree: Map<string, number>
): string {
  const candidates = new Set<string>();

  for (const connection of connections) {
    if (connection.sourceComponentId === componentId && candidateIds.has(connection.targetComponentId)) {
      candidates.add(connection.targetComponentId);
    }
    if (connection.targetComponentId === componentId && candidateIds.has(connection.sourceComponentId)) {
      candidates.add(connection.sourceComponentId);
    }
  }

  if (candidates.size === 0) {
    return "unconnected";
  }

  return [...candidates].sort((a, b) => (degree.get(b) ?? 0) - (degree.get(a) ?? 0))[0] ?? "unconnected";
}

function groupByType(components: Component[]): Map<ComponentType, Component[]> {
  const groups = new Map<ComponentType, Component[]>();
  for (const comp of components) {
    const existing = groups.get(comp.type);
    if (existing) {
      existing.push(comp);
    } else {
      groups.set(comp.type, [comp]);
    }
  }
  return groups;
}

function groupByPrimaryAnchor(
  components: Component[],
  connections: Connection[],
  degree: Map<string, number>
): Map<string, Component[]> {
  const componentIds = new Set(components.map((c) => c.id));
  const groups = new Map<string, Component[]>();

  for (const comp of components) {
    const anchorId = getPrimaryAnchorId(comp.id, connections, componentIds, degree);
    const existing = groups.get(anchorId);
    if (existing) {
      existing.push(comp);
    } else {
      groups.set(anchorId, [comp]);
    }
  }

  return groups;
}

function subGroupByAnchor(
  typeGroup: HierarchyNode,
  type: ComponentType,
  components: Component[],
  connections: Connection[],
  degree: Map<string, number>,
  componentById: Map<string, Component>
): void {
  const byAnchor = groupByPrimaryAnchor(components, connections, degree);

  for (const [anchorId, members] of byAnchor) {
    const ordered = [...members].sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0));
    const anchorName = componentById.get(anchorId)?.name;

    for (let start = 0; start < ordered.length; start += MAX_SUBGROUP_SIZE) {
      const bucket = ordered.slice(start, start + MAX_SUBGROUP_SIZE);
      const bucketIndex = Math.floor(start / MAX_SUBGROUP_SIZE);
      const subgroupName = anchorName
        ? `${TYPE_LABELS[type]} near ${anchorName}${bucketIndex > 0 ? ` (${bucketIndex + 1})` : ""}`
        : `${TYPE_LABELS[type]} group${bucketIndex > 0 ? ` (${bucketIndex + 1})` : ""}`;

      typeGroup.childGroups.push({
        id: `hierarchy:${type}:${anchorId}:${bucketIndex}`,
        name: subgroupName,
        type: "group",
        depth: 2,
        componentIds: bucket.map((c) => c.id),
        childGroups: [],
        metadata: {
          componentCount: bucket.length,
          connectionCount: computeConnectionCount(bucket, connections),
          typeBreakdown: computeTypeBreakdown(bucket)
        }
      });
    }
  }
}

export function buildHierarchy(
  model: ArchitectureModel,
  degree: Map<string, number>
): HierarchyNode {
  const componentById = new Map(model.components.map((c) => [c.id, c]));

  const root: HierarchyNode = {
    id: "root",
    name: "Architecture",
    type: "group",
    depth: 0,
    componentIds: model.components.map((c) => c.id),
    childGroups: [],
    metadata: {
      componentCount: model.components.length,
      connectionCount: model.connections.length,
      typeBreakdown: computeTypeBreakdown(model.components)
    }
  };

  const byType = groupByType(model.components);

  for (const type of TYPE_GROUP_ORDER) {
    const members = byType.get(type);
    if (!members || members.length === 0) continue;

    const typeNode: HierarchyNode = {
      id: `hierarchy:${type}`,
      name: `${TYPE_LABELS[type]} (${members.length})`,
      type,
      depth: 1,
      componentIds: members.map((c) => c.id),
      childGroups: [],
      metadata: {
        componentCount: members.length,
        connectionCount: computeConnectionCount(members, model.connections),
        typeBreakdown: computeTypeBreakdown(members)
      }
    };

    if (members.length > HIERARCHY_CLUSTER_THRESHOLD) {
      subGroupByAnchor(typeNode, type, members, model.connections, degree, componentById);
    }

    root.childGroups.push(typeNode);
  }

  return root;
}

export function findHierarchyNode(root: HierarchyNode, nodeId: string): HierarchyNode | null {
  if (root.id === nodeId) return root;
  for (const child of root.childGroups) {
    const found = findHierarchyNode(child, nodeId);
    if (found) return found;
  }
  return null;
}

export function getDescendantIds(node: HierarchyNode): string[] {
  const ids: string[] = [];
  for (const child of node.childGroups) {
    ids.push(child.id);
    ids.push(...getDescendantIds(child));
  }
  return ids;
}
