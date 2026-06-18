import { useSelectionStore } from "../store/selectionStore";

export function useNodeHighlighting(nodeId: string): {
  isSelected: boolean;
  isDimmed: boolean;
} {
  const isSelected = useSelectionStore((state) => state.selectedNodeId === nodeId);
  const isDimmed = useSelectionStore((state) => state.dimmedNodeIds.has(nodeId));

  return { isSelected, isDimmed };
}
