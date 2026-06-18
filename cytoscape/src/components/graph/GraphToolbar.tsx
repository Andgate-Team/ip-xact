import { IconButton } from "../ui/IconButton";
import { instanceManager } from "../../lib/cytoscape/instanceManager";

export function GraphToolbar() {
  const handleZoomIn = () => {
    const cy = instanceManager.getInstance();
    if (cy) {
      cy.zoom({ level: cy.zoom() * 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    }
  };

  const handleZoomOut = () => {
    const cy = instanceManager.getInstance();
    if (cy) {
      cy.zoom({ level: cy.zoom() / 1.2, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    }
  };

  const handleFitView = () => {
    const cy = instanceManager.getInstance();
    if (cy) {
      cy.animate({ fit: { eles: cy.elements(), padding: 60 }, duration: 400 } as any);
    }
  };

  const handleReset = () => {
    instanceManager.resetView();
  };

  return (
    <div className="absolute right-5 top-5 z-10 flex flex-col gap-2">
      <IconButton onClick={handleZoomIn} title="Zoom in">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </IconButton>
      <IconButton onClick={handleZoomOut} title="Zoom out">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
        </svg>
      </IconButton>
      <IconButton onClick={handleFitView} title="Fit view">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </IconButton>
      <IconButton onClick={handleReset} title="Reset view">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </IconButton>
    </div>
  );
}
