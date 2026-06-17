import { useCallback } from "react";
import { useReactFlow } from "reactflow";
import { useGraphStore } from "../store/graphStore";
import { useSelectionStore } from "../store/selectionStore";

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 88;
const FOCUS_ZOOM = 1.35;

export function useFitViewOnSelect(): (nodeId: string) => void {
  const reactFlow = useReactFlow();
  const selectNode = useSelectionStore((state) => state.selectNode);
  const expandClusterForComponent = useGraphStore((state) => state.expandClusterForComponent);

  return useCallback(
    (nodeId: string) => {
      selectNode(nodeId);
      expandClusterForComponent(nodeId);

      const centerNode = () => {
        const node = reactFlow.getNode(nodeId);

        if (!node) {
          return;
        }

        const width = node.width ?? DEFAULT_NODE_WIDTH;
        const height = node.height ?? DEFAULT_NODE_HEIGHT;
        reactFlow.setCenter(node.position.x + width / 2, node.position.y + height / 2, {
          duration: 420,
          zoom: FOCUS_ZOOM
        });
      };

      window.requestAnimationFrame(() => {
        centerNode();
        window.setTimeout(centerNode, 520);
      });
    },
    [expandClusterForComponent, reactFlow, selectNode]
  );
}
