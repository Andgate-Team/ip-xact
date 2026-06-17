import { useSelectionStore } from "../store/selectionStore";

export function useNodeHighlighting(nodeId: string): {
  isSelected: boolean;
  isExpanded: boolean;
  isDimmed: boolean;
} {
  const isSelected = useSelectionStore((state) => state.selectedNodeId === nodeId);
  const isExpanded = useSelectionStore((state) => state.expandedNodeId === nodeId);
  const isDimmed = useSelectionStore((state) => state.dimmedNodeIds.has(nodeId));

  return { isSelected, isExpanded, isDimmed };
}
