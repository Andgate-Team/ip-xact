import { useEffect, useState } from "react";
import { nodeColorMap } from "../../lib/transform/colorMap";
import { instanceManager } from "../../lib/cytoscape/instanceManager";
import { useArchitectureStore } from "../../store/architectureStore";
import type { ComponentType } from "../../types";

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  componentId: string | null;
}

export function NodeTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, componentId: null });
  const getComponent = useArchitectureStore((state) => state.getComponent);

  useEffect(() => {
    const cy = instanceManager.getInstance();
    if (!cy) return;

    const handleMouseOver = (e: any) => {
      if (e.target.isNode()) {
        const node = e.target;
        const renderedPos = node.renderedPosition();
        const containerRect = cy.container()?.getBoundingClientRect();
        if (!containerRect) return;

        setTooltip({
          visible: true,
          x: containerRect.left + renderedPos.x + 20,
          y: containerRect.top + renderedPos.y - 10,
          componentId: node.id()
        });
      }
    };

    const handleMouseOut = (e: any) => {
      if (e.target.isNode()) {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };

    const handleMouseMove = (e: any) => {
      if (e.originalEvent) {
        setTooltip((prev) => ({
          ...prev,
          x: e.originalEvent.clientX + 15,
          y: e.originalEvent.clientY - 10
        }));
      }
    };

    cy.on("mouseover", "node", handleMouseOver);
    cy.on("mouseout", "node", handleMouseOut);
    cy.on("mousemove", handleMouseMove);

    return () => {
      cy.removeListener("mouseover", "node", handleMouseOver);
      cy.removeListener("mouseout", "node", handleMouseOut);
      cy.removeListener("mousemove", handleMouseMove);
    };
  }, []);

  if (!tooltip.visible || !tooltip.componentId) return null;

  const component = getComponent(tooltip.componentId);
  if (!component) return null;

  const colors = nodeColorMap[component.type as ComponentType] ?? nodeColorMap.custom;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-lg border border-white/20 bg-shell-900/95 px-3 py-2 shadow-xl backdrop-blur-sm"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <div className="flex items-center gap-2">
        <div
          className="h-2.5 w-2.5 rounded-sm"
          style={{ backgroundColor: colors.base, borderColor: colors.border, borderWidth: 1 }}
        />
        <span className="text-sm font-semibold text-slate-100">{component.name}</span>
      </div>
      <div className="mt-1 font-mono text-[11px] text-slate-500">{component.type}</div>
      <div className="mt-0.5 text-[11px] text-slate-400">
        {component.ports.length} ports / {component.registers.length} registers
      </div>
    </div>
  );
}
