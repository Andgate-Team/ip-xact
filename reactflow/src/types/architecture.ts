export type ComponentType =
  | "cpu"
  | "bus"
  | "memory"
  | "peripheral"
  | "interface"
  | "clockReset"
  | "custom";

export type PortDirection = "in" | "out" | "inout";

export interface Port {
  id: string;
  name: string;
  direction: PortDirection;
  width?: number;
}

export interface Register {
  id: string;
  name: string;
  address?: string;
  description?: string;
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  ports: Port[];
  registers: Register[];
}

export interface Connection {
  id: string;
  sourceComponentId: string;
  sourcePortId: string;
  targetComponentId: string;
  targetPortId: string;
}

export interface ArchitectureModel {
  components: Component[];
  connections: Connection[];
}
