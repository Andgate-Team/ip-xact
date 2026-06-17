import type { Edge, Node } from "reactflow";
import type { Component, ComponentType, Connection } from "./architecture";

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
}

export interface ClusterNodeData {
  kind: "cluster";
  cluster: ArchitectureCluster;
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

export type ArchitectureNodeData = ComponentNodeData | ClusterNodeData;

export interface ArchitectureEdgeData {
  connection: Connection;
  connectionCount?: number;
}

export type ArchitectureFlowNode = Node<ArchitectureNodeData, "architecture">;
export type ArchitectureFlowEdge = Edge<ArchitectureEdgeData>;

export type EdgeVisualState = "highlighted" | "dimmed" | "neutral";
