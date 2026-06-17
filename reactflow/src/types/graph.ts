import type { Edge, Node } from "reactflow";
import type { Component, ComponentType, Connection } from "./architecture";

export interface ComponentNodeData {
  kind: "component";
  component: Component;
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
}

export type ArchitectureNodeData = ComponentNodeData | ClusterNodeData;

export interface ArchitectureEdgeData {
  connection: Connection;
  connectionCount?: number;
}

export type ArchitectureFlowNode = Node<ArchitectureNodeData, "architecture">;
export type ArchitectureFlowEdge = Edge<ArchitectureEdgeData>;

export type EdgeVisualState = "highlighted" | "dimmed" | "neutral";
