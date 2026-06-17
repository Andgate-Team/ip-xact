import type { ComponentType } from "../../types";

export interface NodeColorTokens {
  base: string;
  border: string;
  glow: string;
  text: string;
}

export const nodeColorMap = {
  cpu: { base: "#2563eb", border: "#60a5fa", glow: "rgba(37, 99, 235, 0.38)", text: "#dbeafe" },
  bus: { base: "#7c3aed", border: "#a78bfa", glow: "rgba(124, 58, 237, 0.36)", text: "#ede9fe" },
  memory: { base: "#16a34a", border: "#4ade80", glow: "rgba(22, 163, 74, 0.34)", text: "#dcfce7" },
  peripheral: { base: "#ea580c", border: "#fb923c", glow: "rgba(234, 88, 12, 0.32)", text: "#ffedd5" },
  interface: { base: "#0891b2", border: "#22d3ee", glow: "rgba(8, 145, 178, 0.34)", text: "#cffafe" },
  clockReset: { base: "#dc2626", border: "#f87171", glow: "rgba(220, 38, 38, 0.34)", text: "#fee2e2" },
  custom: { base: "#64748b", border: "#94a3b8", glow: "rgba(100, 116, 139, 0.34)", text: "#f1f5f9" },
  dma: { base: "#0d9488", border: "#2dd4bf", glow: "rgba(13, 148, 136, 0.34)", text: "#ccfbf1" },
  interruptController: { base: "#c026d3", border: "#e879f9", glow: "rgba(192, 38, 211, 0.34)", text: "#f5d0fe" },
  debug: { base: "#475569", border: "#94a3b8", glow: "rgba(71, 85, 105, 0.34)", text: "#e2e8f0" }
} satisfies Record<ComponentType, NodeColorTokens>;
