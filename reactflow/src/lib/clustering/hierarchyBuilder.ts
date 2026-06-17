import type { ArchitectureModel, Component, ComponentType, Connection } from "../../types";
import type { HierarchyNode } from "../../types";

const EXPAND_THRESHOLD = 6;

const TYPE_GROUP_ORDER: ComponentType[] = ["cpu", "bus", "memory", "peripheral", "interface", "clockReset", "custom", "dma", "interruptController", "debug"];

const TYPE_LABELS: Record<ComponentType, string> = {
  cpu: "CPU",
  bus: "Bus",
  memory: "Memory",
  peripheral: "Peripheral",
  interface: "Interface",
  clockReset: "Clock/Reset",
  custom: "Custom",
  dma: "DMA",
  interruptController: "Interrupt Controller",
  debug: "Debug"
};

const NUMERIC_SUFFIX = /\d+$/;

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

function extractBasePrefix(name: string): string {
  const stripped = name.replace(NUMERIC_SUFFIX, "").trim();
  const parts = stripped.split(/[\s_\-]+/);
  return parts[parts.length - 1] ?? stripped;
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

function groupByPrefix(components: Component[]): Map<string, Component[]> {
  const groups = new Map<string, Component[]>();
  for (const comp of components) {
    const prefix = extractBasePrefix(comp.name);
    const existing = groups.get(prefix);
    if (existing) {
      existing.push(comp);
    } else {
      groups.set(prefix, [comp]);
    }
  }
  return groups;
}

function splitIntoChunks(components: Component[], chunkSize: number): Component[][] {
  const chunks: Component[][] = [];
  for (let i = 0; i < components.length; i += chunkSize) {
    chunks.push(components.slice(i, i + chunkSize));
  }
  return chunks;
}

function buildSubGroups(
  components: Component[],
  connections: Connection[],
  depth: number,
  parentPath: string
): HierarchyNode[] {
  if (components.length <= EXPAND_THRESHOLD) {
    return [];
  }

  const byPrefix = groupByPrefix(components);
  const prefixes = [...byPrefix.keys()].sort();

  if (prefixes.length >= 2 && components.length > EXPAND_THRESHOLD * 2) {
    const groups: HierarchyNode[] = [];
    for (const prefix of prefixes) {
      const members = byPrefix.get(prefix)!;
      if (members.length === 0) continue;

      const groupId = `${parentPath}:${prefix.toLowerCase()}`;
      const hasChildren = members.length > EXPAND_THRESHOLD;

      groups.push({
        id: groupId,
        name: members.length > 1 ? `${prefix} (${members.length})` : members[0]?.name ?? prefix,
        type: members[0]?.type ?? "custom",
        depth,
        componentIds: members.map((c) => c.id),
        childGroups: hasChildren ? buildSubGroups(members, connections, depth + 1, groupId) : [],
        metadata: {
          componentCount: members.length,
          connectionCount: computeConnectionCount(members, connections),
          typeBreakdown: computeTypeBreakdown(members)
        }
      });
    }
    return groups;
  }

  const chunkSize = Math.max(EXPAND_THRESHOLD, Math.ceil(components.length / 4));
  const chunks = splitIntoChunks(components, chunkSize);
  const groups: HierarchyNode[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (!chunk || chunk.length === 0) continue;

    const groupId = `${parentPath}:part${i}`;
    const hasChildren = chunk.length > EXPAND_THRESHOLD;
    const firstName = chunk[0]?.name ?? `Part ${i + 1}`;
    const lastName = chunk[chunk.length - 1]?.name ?? firstName;
    const label = chunk.length > 2 ? `${firstName}..${lastName}` : firstName;

    groups.push({
      id: groupId,
      name: `${label} (${chunk.length})`,
      type: chunk[0]?.type ?? "custom",
      depth,
      componentIds: chunk.map((c) => c.id),
      childGroups: hasChildren ? buildSubGroups(chunk, connections, depth + 1, groupId) : [],
      metadata: {
        componentCount: chunk.length,
        connectionCount: computeConnectionCount(chunk, connections),
        typeBreakdown: computeTypeBreakdown(chunk)
      }
    });
  }

  return groups;
}

export function buildHierarchy(
  model: ArchitectureModel,
  degree: Map<string, number>
): HierarchyNode {
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

    const typeGroupId = `hierarchy:${type}`;
    const needsSubGroups = members.length > EXPAND_THRESHOLD;

    const typeNode: HierarchyNode = {
      id: typeGroupId,
      name: `${TYPE_LABELS[type]} (${members.length})`,
      type,
      depth: 1,
      componentIds: members.map((c) => c.id),
      childGroups: needsSubGroups ? buildSubGroups(members, model.connections, 2, typeGroupId) : [],
      metadata: {
        componentCount: members.length,
        connectionCount: computeConnectionCount(members, model.connections),
        typeBreakdown: computeTypeBreakdown(members)
      }
    };

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
