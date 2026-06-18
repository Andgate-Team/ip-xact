import { useEffect } from "react";
import { cytoscapeAdapter } from "../lib/cytoscape/cytoscapeAdapter";
import { instanceManager } from "../lib/cytoscape/instanceManager";
import { computeLayout } from "../lib/cytoscape/elkWorker";
import { useArchitectureStore } from "../store/architectureStore";
import { useGraphStore } from "../store/graphStore";
import type { CytoscapeElement } from "../types";

const CHUNK_SIZE = 500;

export function useElkLayout(): void {
  const model = useArchitectureStore((state) => state.model);
  const setElements = useGraphStore((state) => state.setElements);
  const setLayoutLoading = useGraphStore((state) => state.setLayoutLoading);
  const setRenderProgress = useGraphStore((state) => state.setRenderProgress);

  useEffect(() => {
    if (!model) return;

    setLayoutLoading(true);
    setRenderProgress(null);

    computeLayout(model).then((positions) => {
      const allElements = cytoscapeAdapter(model, positions);

      if (allElements.length <= CHUNK_SIZE) {
        setElements(allElements);
        setLayoutLoading(false);
        fitView();
      } else {
        setLayoutLoading(false);
        progressiveRender(allElements);
      }
    });

    return () => {
      setLayoutLoading(false);
      setRenderProgress(null);
    };
  }, [model, setElements, setLayoutLoading, setRenderProgress]);

  function fitView() {
    requestAnimationFrame(() => {
      const cy = instanceManager.getInstance();
      if (cy) {
        cy.resize();
        cy.fit(undefined, 50);
      }
    });
  }

  async function progressiveRender(allElements: CytoscapeElement[]) {
    const nodes = allElements.filter((e) => e.group === "nodes");
    const edges = allElements.filter((e) => e.group === "edges");
    const total = nodes.length;
    let added = 0;

    for (let i = 0; i < nodes.length; i += CHUNK_SIZE) {
      const chunkLen = Math.min(CHUNK_SIZE, nodes.length - i);
      setElements([...nodes.slice(0, i + chunkLen), ...edges.slice(0, Math.min(i + chunkLen, edges.length))]);
      added += chunkLen;
      setRenderProgress({ current: added, total });
      await new Promise((r) => requestAnimationFrame(r));
    }

    setElements(allElements);
    setRenderProgress(null);
    fitView();
  }
}
