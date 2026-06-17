import type { Component, Connection } from "../../types";
import type { ComponentMetadata, SemanticGroup } from "./types";

const NUMERIC_SUFFIX = /\d+$/;

function stripNumericSuffix(name: string): string {
  return name.replace(NUMERIC_SUFFIX, "").trim();
}

function extractBasePrefix(name: string): string {
  const stripped = stripNumericSuffix(name);
  const parts = stripped.split(/[\s_\-]+/);
  const last = parts[parts.length - 1];
  return last ?? stripped;
}

const SKIP_GROUPING = new Set(["cpu", "bus", "clockReset", "debug"]);

export function detectGroups(
  components: Component[],
  metadata: Map<string, ComponentMetadata>
): SemanticGroup[] {
  const prefixMap = new Map<string, { category: string; ids: string[]; names: string[] }>();

  for (const comp of components) {
    const meta = metadata.get(comp.id);
    if (!meta || SKIP_GROUPING.has(meta.category)) continue;

    const prefix = extractBasePrefix(comp.name);
    const existing = prefixMap.get(prefix);
    if (existing) {
      existing.ids.push(comp.id);
      existing.names.push(comp.name);
    } else {
      prefixMap.set(prefix, {
        category: meta.category,
        ids: [comp.id],
        names: [comp.name]
      });
    }
  }

  const groups: SemanticGroup[] = [];

  for (const [prefix, entry] of prefixMap) {
    if (entry.ids.length < 2) continue;

    const first = entry.names[0];
    const baseName = first ? first.replace(NUMERIC_SUFFIX, "").trim() : prefix;
    groups.push({
      id: `group:${prefix.toLowerCase()}`,
      name: `${baseName} Group`,
      componentIds: entry.ids,
      category: entry.category as SemanticGroup["category"]
    });
  }

  return groups;
}
