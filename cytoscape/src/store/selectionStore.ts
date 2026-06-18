import { create } from "zustand";
import { useArchitectureStore } from "./architectureStore";

interface SelectionStore {
  selectedNodeId: string | null;
  highlightedNodeIds: Set<string>;
  dimmedNodeIds: Set<string>;
  highlightedEdgeIds: Set<string>;
  selectNode: (id: string | null) => void;
  resetSelection: () => void;
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
  ...emptySets(),
  selectNode: (id) => {
    const architecture = useArchitectureStore.getState();

    if (!id || !architecture.model) {
      set({ selectedNodeId: id, ...emptySets() });
      return;
    }

    const highlightedNodeIds = new Set<string>([id]);
    const highlightedEdgeIds = new Set<string>(architecture.edgeIdsByComponentId.get(id) ?? []);

    for (const connection of architecture.getIncoming(id)) {
      highlightedNodeIds.add(connection.sourceComponentId);
      highlightedEdgeIds.add(connection.id);
    }

    for (const connection of architecture.getOutgoing(id)) {
      highlightedNodeIds.add(connection.targetComponentId);
      highlightedEdgeIds.add(connection.id);
    }

    set({ selectedNodeId: id, highlightedNodeIds, highlightedEdgeIds, dimmedNodeIds: new Set() });
  },
  resetSelection: () => set({ selectedNodeId: null, ...emptySets() })
}));
