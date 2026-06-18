import { useEffect } from "react";
import { instanceManager } from "../lib/cytoscape/instanceManager";

export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const cy = instanceManager.getInstance();
      if (!cy) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "=") {
        e.preventDefault();
        cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
      } else if (ctrl && e.key === "-") {
        e.preventDefault();
        cy.zoom({ level: cy.zoom() / 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
      } else if (ctrl && e.key === "0") {
        e.preventDefault();
        cy.animate({ fit: { eles: cy.elements(), padding: 60 }, duration: 300 } as any);
      } else if (ctrl && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector("[data-search-input]") as HTMLInputElement;
        if (searchInput) searchInput.focus();
      } else if (e.key === "Escape") {
        instanceManager.resetView();
      } else if (e.key === "1") {
        cy.animate({ zoom: { level: 0.3, position: cy.pan()}, duration: 300 } as any);
      } else if (e.key === "2") {
        cy.animate({ zoom: { level: 0.6, position: cy.pan()}, duration: 300 } as any);
      } else if (e.key === "3") {
        cy.animate({ zoom: { level: 1, position: cy.pan()}, duration: 300 } as any);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}
