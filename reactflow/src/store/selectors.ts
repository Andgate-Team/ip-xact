import { useArchitectureStore } from "./architectureStore";
import { useSelectionStore } from "./selectionStore";
import type { EdgeVisualState } from "../types";

export function getEdgeVisualState(edgeId: string): EdgeVisualState {
  const selection = useSelectionStore.getState();

  if (selection.highlightedEdgeIds.has(edgeId)) {
    return "highlighted";
  }

  if (selection.selectedNodeId) {
    return "dimmed";
  }

  return "neutral";
}

export function getConnectedComponentNames(componentId: string): string[] {
  const architecture = useArchitectureStore.getState();
  const names = new Set<string>();

  for (const connection of architecture.getIncoming(componentId)) {
    const component = architecture.getComponent(connection.sourceComponentId);
    if (component) {
      names.add(component.name);
    }
  }

  for (const connection of architecture.getOutgoing(componentId)) {
    const component = architecture.getComponent(connection.targetComponentId);
    if (component) {
      names.add(component.name);
    }
  }

  return [...names].sort();
}
