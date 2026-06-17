import type { ElkNode } from "elkjs";
import type { ArchitectureModel } from "../../types";

const layoutCache = new Map<string, ElkNode>();

export function getLayoutCacheKey(model: ArchitectureModel, expansionPath?: string[]): string {
  const nodeIds = model.components.map((component) => component.id).sort().join("|");
  const edgeIds = model.connections.map((connection) => connection.id).sort().join("|");
  const pathKey = expansionPath?.length ? `::path:${expansionPath.join("|")}` : "";
  return `${nodeIds}::${edgeIds}${pathKey}`;
}

export function getCachedLayout(key: string): ElkNode | undefined {
  return layoutCache.get(key);
}

export function setCachedLayout(key: string, graph: ElkNode): void {
  layoutCache.set(key, graph);
}
