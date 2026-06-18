import type { ComponentType } from "../../types";

export interface NodeColorTokens {
  base: string;
  border: string;
  glow: string;
  fill: string;
  text: string;
}

export const nodeColorMap = {
  cpu: { base: "#3b82f6", border: "#60a5fa", glow: "rgba(59, 130, 246, 0.4)", fill: "#1e3a5f", text: "#dbeafe" },
  bus: { base: "#8b5cf6", border: "#a78bfa", glow: "rgba(139, 92, 246, 0.4)", fill: "#3b2069", text: "#ede9fe" },
  memory: { base: "#22c55e", border: "#4ade80", glow: "rgba(34, 197, 94, 0.4)", fill: "#14532d", text: "#dcfce7" },
  peripheral: { base: "#f97316", border: "#fb923c", glow: "rgba(249, 115, 22, 0.4)", fill: "#7c2d12", text: "#ffedd5" },
  interface: { base: "#06b6d4", border: "#22d3ee", glow: "rgba(6, 182, 212, 0.4)", fill: "#164e63", text: "#cffafe" },
  clockReset: { base: "#ef4444", border: "#f87171", glow: "rgba(239, 68, 68, 0.4)", fill: "#7f1d1d", text: "#fee2e2" },
  custom: { base: "#64748b", border: "#94a3b8", glow: "rgba(100, 116, 139, 0.4)", fill: "#334155", text: "#f1f5f9" },
  dma: { base: "#14b8a6", border: "#2dd4bf", glow: "rgba(20, 184, 166, 0.4)", fill: "#134e4a", text: "#ccfbf1" },
  interruptController: { base: "#d946ef", border: "#e879f9", glow: "rgba(217, 70, 239, 0.4)", fill: "#701a75", text: "#f5d0fe" },
  debug: { base: "#64748b", border: "#94a3b8", glow: "rgba(100, 116, 139, 0.4)", fill: "#334155", text: "#e2e8f0" }
} satisfies Record<ComponentType, NodeColorTokens>;

export function buildCytoscapeColorStyles(colorMap: typeof nodeColorMap) {
  return Object.entries(colorMap).map(([type, colors]) => ({
    selector: `node[type = "${type}"]`,
    style: {
      "background-color": colors.fill,
      "border-color": colors.border,
      "border-width": 2,
      color: colors.text,
    }
  }));
}
