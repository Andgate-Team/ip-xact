import type { Edge, Node } from "reactflow";
import type { Component, ComponentType, Connection } from "./architecture";
import type { ConnectionType, LayoutLayer } from "../lib/preprocess/types";

export interface PortPosition {
  portId: string;
  x: number;
  y: number;
  side: "LEFT" | "RIGHT" | "TOP" | "BOTTOM";
}

export interface ComponentNodeData {
  kind: "component";
  component: Component;
  portPositions?: PortPosition[];
  layer?: LayoutLayer;
}

export interface ClusterNodeData {
  kind: "cluster";
  cluster: ArchitectureCluster;
}

export interface BusChannelNodeData {
  kind: "busChannel";
  component: Component;
  layer: LayoutLayer;
  portPositions?: PortPosition[];
}

export interface ArchitectureCluster {
  id: string;
  name: string;
  type: ComponentType;
  componentIds: string[];
  componentCount: number;
  connectionCount: number;
  expanded: boolean;
  hierarchyPath: string[];
  depth: number;
  typeBreakdown?: Partial<Record<ComponentType, number>>;
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: ComponentType | "group";
  depth: number;
  componentIds: string[];
  childGroups: HierarchyNode[];
  metadata: {
    componentCount: number;
    connectionCount: number;
    typeBreakdown: Partial<Record<ComponentType, number>>;
  };
}

export type ArchitectureNodeData = ComponentNodeData | ClusterNodeData | BusChannelNodeData;

export interface ArchitectureEdgeData {
  connection: Connection;
  connectionCount?: number;
  connectionType?: ConnectionType;
}

export type ArchitectureFlowNode = Node<ArchitectureNodeData, "architecture" | "busChannel">;
export type ArchitectureFlowEdge = Edge<ArchitectureEdgeData>;

export type EdgeVisualState = "highlighted" | "dimmed" | "neutral";
