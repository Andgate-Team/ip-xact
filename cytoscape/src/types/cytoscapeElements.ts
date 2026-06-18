import type { ComponentType } from "./architecture";

export interface CytoscapeNodeData {
  id: string;
  label: string;
  type: ComponentType;
}

export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  sourcePortId: string;
  targetPortId: string;
  label: string;
}

export interface CytoscapeNodeElement {
  group: "nodes";
  data: CytoscapeNodeData;
  position?: { x: number; y: number };
}

export interface CytoscapeEdgeElement {
  group: "edges";
  data: CytoscapeEdgeData;
}

export type CytoscapeElement = CytoscapeNodeElement | CytoscapeEdgeElement;
