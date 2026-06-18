import { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import { cytoscapeStylesheet } from "../../lib/cytoscape/styleSheet";
import { instanceManager } from "../../lib/cytoscape/instanceManager";
import { useGraphStore } from "../../store/graphStore";
import { LoadingSkeleton } from "./LoadingSkeleton";

const EDGE_DETAIL_ZOOM = 0.15;
const LABEL_DETAIL_ZOOM = 0.4;
const ZOOM_DEBOUNCE_MS = 100;

function getNodeStyle(zoom: number) {
  if (zoom < 0.08) return { width: 12, height: 12, label: "", "border-width": 1, "font-size": 0 };
  if (zoom < 0.2) return { width: 40, height: 20, label: zoom >= 0.12 ? "data(label)" : "", "border-width": 1, "font-size": 8 };
  if (zoom < 0.5) return { width: 120, height: 50, label: "data(label)", "border-width": 1.5, "font-size": 10 };
  return { width: 220, height: 88, label: "data(label)", "border-width": 2, "font-size": 13 };
}

function applyLodStyles(cy: cytoscape.Core) {
  const zoom = cy.zoom();
  const nodeStyle = getNodeStyle(zoom);
  const showEdges = zoom >= EDGE_DETAIL_ZOOM;
  const showEdgeLabels = zoom >= LABEL_DETAIL_ZOOM;

  const extent = cy.extent();
  const margin = 200;
  const viewportBox = {
    x1: extent.x1 - margin,
    y1: extent.y1 - margin,
    x2: extent.x2 + margin,
    y2: extent.y2 + margin
  };

  cy.batch(() => {
    cy.edges().forEach((edge) => {
      if (!showEdges) {
        edge.style("display", "none");
      } else {
        const source = edge.source().position();
        const target = edge.target().position();
        const onScreen =
          (source.x >= viewportBox.x1 && source.x <= viewportBox.x2 &&
            source.y >= viewportBox.y1 && source.y <= viewportBox.y2) ||
          (target.x >= viewportBox.x1 && target.x <= viewportBox.x2 &&
            target.y >= viewportBox.y1 && target.y <= viewportBox.y2);
        edge.style("display", onScreen ? "element" : "none");
        if (onScreen) {
          edge.style("text-opacity", showEdgeLabels ? "0.7" : "0");
        }
      }
    });

    cy.nodes().forEach((node) => {
      const pos = node.position();
      const onScreen =
        pos.x >= viewportBox.x1 && pos.x <= viewportBox.x2 &&
        pos.y >= viewportBox.y1 && pos.y <= viewportBox.y2;

      if (!onScreen) {
        node.style("display", "none");
      } else {
        node.style("display", "element");
        node.style("width", nodeStyle.width);
        node.style("height", nodeStyle.height);
        node.style("label", nodeStyle.label);
        node.style("border-width", nodeStyle["border-width"]);
        node.style("font-size", nodeStyle["font-size"]);
      }
    });
  });
}

export function CytoscapeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elements = useGraphStore((state) => state.elements);
  const isLayoutLoading = useGraphStore((state) => state.isLayoutLoading);
  const renderProgress = useGraphStore((state) => state.renderProgress);

  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: cytoscapeStylesheet as any,
      layout: { name: "preset" },
      minZoom: 0.05,
      maxZoom: 3,
      wheelSensitivity: 0.2,
      boxSelectionEnabled: false,
      autoungrabify: false,
      autounselectify: false
    });

    cyRef.current = cy;
    instanceManager.setInstance(cy);

    cy.on("tap", "node", (event) => {
      instanceManager.selectNode(event.target.id());
    });

    cy.on("tap", (event) => {
      if (event.target === cy) {
        instanceManager.resetView();
      }
    });

    const scheduleLodUpdate = () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = setTimeout(() => applyLodStyles(cy), ZOOM_DEBOUNCE_MS);
    };

    cy.on("zoom", scheduleLodUpdate);
    cy.on("pan", scheduleLodUpdate);

    return () => {
      if (zoomTimerRef.current) clearTimeout(zoomTimerRef.current);
      cy.destroy();
      cyRef.current = null;
      instanceManager.setInstance(null as any);
    };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || elements.length === 0) return;

    const newIds = new Set(elements.map((e) => e.data.id));
    const existingIds = new Set(cy.elements().map((e) => e.id()));

    cy.startBatch();

    const toRemove = cy.elements().filter((e) => !newIds.has(e.id()));
    if (toRemove.length > 0) {
      cy.remove(toRemove);
    }

    const toAdd = elements.filter((e) => !existingIds.has(e.data.id));
    if (toAdd.length > 0) {
      cy.add(toAdd as any);
    }

    cy.endBatch();
    cy.resize();
    applyLodStyles(cy);
  }, [elements]);

  return (
    <div className="relative h-full w-full cytoscape-container">
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {isLayoutLoading && <LoadingSkeleton progress={renderProgress} />}
    </div>
  );
}
