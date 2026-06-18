import type { Core, NodeSingular } from "cytoscape";
import { useSelectionStore } from "../../store/selectionStore";

let cyInstance: Core | null = null;

export const instanceManager = {
  setInstance(cy: Core) {
    cyInstance = cy;
  },

  getInstance(): Core | null {
    return cyInstance;
  },

  selectNode(id: string | null) {
    if (!cyInstance) return;

    cyInstance.batch(() => {
      if (!cyInstance) return;

      cyInstance.elements().removeClass("highlighted dimmed");

      if (!id) {
        useSelectionStore.getState().selectNode(null);
        return;
      }

      const node = cyInstance.getElementById(id);
      if (node.length === 0) return;

      const neighborhood = node.closedNeighborhood().add(node.connectedEdges().connectedNodes());
      const connectedEdges = node.connectedEdges();

      neighborhood.addClass("highlighted");
      connectedEdges.addClass("highlighted");

      cyInstance.elements().not(neighborhood).not(connectedEdges).addClass("dimmed");
    });

    useSelectionStore.getState().selectNode(id);
  },

  highlightConnections(id: string) {
    this.selectNode(id);
  },

  focusNode(id: string) {
    if (!cyInstance) return;

    const node = cyInstance.getElementById(id);
    if (node.length === 0) return;

    this.selectNode(id);

    cyInstance.animate({
      fit: {
        eles: node,
        padding: 80
      },
      duration: 400
    } as any);
  },

  resetView() {
    if (!cyInstance) return;

    cyInstance.batch(() => {
      if (!cyInstance) return;
      cyInstance.elements().removeClass("highlighted dimmed");
    });

    useSelectionStore.getState().resetSelection();

    cyInstance.animate({
      fit: { eles: cyInstance.elements(), padding: 60 },
      duration: 400
    } as any);
  }
};
