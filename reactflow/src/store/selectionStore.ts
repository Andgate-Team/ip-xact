import { create } from "zustand";
import { useArchitectureStore } from "./architectureStore";

interface SelectionStore {
  selectedNodeId: string | null;
  expandedNodeId: string | null;
  searchQuery: string;
  highlightedNodeIds: Set<string>;
  dimmedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  selectNode: (id: string | null) => void;
  expandNode: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
}

function emptySets() {
  return {
    highlightedNodeIds: new Set<string>(),
    dimmedNodeIds: new Set<string>(),
    highlightedEdgeIds: new Set<string>()
  };
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  selectedNodeId: null,
  expandedNodeId: null,
  searchQuery: "",
  ...emptySets(),
  selectNode: (id) => {
    const architecture = useArchitectureStore.getState();
    const model = architecture.model;

    if (!id || !model) {
      set({ selectedNodeId: id, ...emptySets() });
      return;
    }

    const highlightedNodeIds = new Set<string>([id]);
    const highlightedEdgeIds = new Set<string>(architecture.edgeIdsByComponentId.get(id) ?? []);

    for (const connection of architecture.getIncoming(id)) {
      highlightedNodeIds.add(connection.sourceComponentId);
    }

    for (const connection of architecture.getOutgoing(id)) {
      highlightedNodeIds.add(connection.targetComponentId);
    }

    const dimmedNodeIds = new Set<string>();
    for (const component of model.components) {
      if (!highlightedNodeIds.has(component.id)) {
        dimmedNodeIds.add(component.id);
      }
    }

    set({ selectedNodeId: id, highlightedNodeIds, highlightedEdgeIds, dimmedNodeIds });
  },
  expandNode: (id) => set((state) => ({ expandedNodeId: state.expandedNodeId === id ? null : id })),
  setSearchQuery: (query) => set({ searchQuery: query })
}));
