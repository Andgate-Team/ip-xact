import type { ComponentType } from "../../types";

export type ComponentCategory = ComponentType;

export type LayoutLayer = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ConnectionType =
  | "bus"
  | "interrupt"
  | "dma"
  | "clock"
  | "reset"
  | "debug"
  | "data"
  | "control"
  | "unknown";

export type PortSide = "WEST" | "EAST" | "NORTH" | "SOUTH";

export interface ComponentMetadata {
  category: ComponentCategory;
  layer: LayoutLayer;
  groupId: string | null;
}

export interface ConnectionMetadata {
  connectionType: ConnectionType;
  sourcePortSide: PortSide;
  targetPortSide: PortSide;
}

export interface SemanticGroup {
  id: string;
  name: string;
  componentIds: string[];
  category: ComponentCategory;
}

export interface ELKLayoutHints {
  layerConstraints: Record<string, LayoutLayer>;
  portConstraints: Record<string, Record<string, PortSide>>;
  groupHints: Array<{ id: string; children: string[] }>;
  elkOptions: Record<string, string>;
}
