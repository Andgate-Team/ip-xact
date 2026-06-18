import { useCallback } from "react";
import { instanceManager } from "../lib/cytoscape/instanceManager";
import { useSelectionStore } from "../store/selectionStore";

export function useFitViewOnSelect(): (nodeId: string) => void {
  const selectNode = useSelectionStore((state) => state.selectNode);

  return useCallback(
    (nodeId: string) => {
      instanceManager.focusNode(nodeId);
      selectNode(nodeId);
    },
    [selectNode]
  );
}
