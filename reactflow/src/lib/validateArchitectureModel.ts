import type { ArchitectureModel, Component, ComponentType, Connection, Port, PortDirection, Register } from "../types";

const componentTypes = new Set<ComponentType>([
  "cpu",
  "bus",
  "memory",
  "peripheral",
  "interface",
  "clockReset",
  "custom"
]);

const portDirections = new Set<PortDirection>(["in", "out", "inout"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function toId(value: string): string {
  return value.trim().replace(/\s+/g, "_");
}

function inferComponentType(name: string, rawType: string): ComponentType {
  const type = rawType.trim().toLowerCase();
  const componentName = name.trim().toLowerCase();

  if (type === "bus" || componentName.includes("bus")) {
    return "bus";
  }

  if (type === "cpu" || componentName.includes("cpu")) {
    return "cpu";
  }

  if (type === "memory" || componentName.includes("ram") || componentName.includes("rom") || componentName.includes("memory")) {
    return "memory";
  }

  if (type === "interface" || componentName.includes("pad") || componentName.includes("interface")) {
    return "interface";
  }

  if (type === "clockreset" || type === "clock_reset" || componentName.includes("clock") || componentName.includes("reset")) {
    return "clockReset";
  }

  if (type === "peripheral" || type === "component") {
    return "peripheral";
  }

  return componentTypes.has(rawType as ComponentType) ? (rawType as ComponentType) : "custom";
}

function normalizePorts(componentId: string, ports: unknown): Port[] {
  if (!Array.isArray(ports)) {
    throw new Error(`Component ${componentId} needs ports[].`);
  }

  return ports.map((port, index) => {
    if (isString(port)) {
      const id = toId(port);
      return { id, name: port, direction: "inout" as const };
    }

    if (!isRecord(port) || !isString(port.id) || !isString(port.name) || !portDirections.has(port.direction as PortDirection)) {
      throw new Error(`Component ${componentId} has an invalid port.`);
    }

    return port as unknown as Port;
  }).filter((port, index, allPorts) => allPorts.findIndex((candidate) => candidate.id === port.id) === index);
}

function normalizeRegisters(componentId: string, registers: unknown): Register[] {
  if (!Array.isArray(registers)) {
    throw new Error(`Component ${componentId} needs registers[].`);
  }

  return registers.map((register) => {
    if (isString(register)) {
      return { id: toId(register), name: register };
    }

    if (!isRecord(register) || !isString(register.id) || !isString(register.name)) {
      throw new Error(`Component ${componentId} has an invalid register.`);
    }

    return register as unknown as Register;
  }).filter((register, index, allRegisters) => allRegisters.findIndex((candidate) => candidate.id === register.id) === index);
}

function normalizeComponents(components: unknown): Component[] {
  if (Array.isArray(components)) {
    return components.map((component) => {
      if (!isRecord(component) || !isString(component.id) || !isString(component.name) || !isString(component.type)) {
        throw new Error("Each component needs id, name, type, ports[], and registers[].");
      }

      return {
        id: component.id,
        name: component.name,
        type: inferComponentType(component.name, component.type),
        ports: normalizePorts(component.id, component.ports),
        registers: normalizeRegisters(component.id, component.registers)
      };
    });
  }

  if (isRecord(components)) {
    return Object.entries(components).map(([name, component]) => {
      if (!isRecord(component) || !isString(component.type)) {
        throw new Error(`Component ${name} needs type, ports[], and registers[].`);
      }

      const id = toId(name);
      return {
        id,
        name,
        type: inferComponentType(name, component.type),
        ports: normalizePorts(id, component.ports),
        registers: normalizeRegisters(id, component.registers)
      };
    });
  }

  throw new Error("JSON must contain components and connections[].");
}

function firstPortId(component: Component | undefined): string {
  return component?.ports[0]?.id ?? "default";
}

function normalizeConnections(connections: unknown, components: Component[]): Connection[] {
  if (!Array.isArray(connections)) {
    throw new Error("JSON must contain components and connections[].");
  }

  const componentById = new Map(components.map((component) => [component.id, component]));
  const componentByName = new Map(components.map((component) => [component.name, component]));

  return connections.map((connection, index) => {
    if (!isRecord(connection)) {
      throw new Error("Each connection needs source and target components.");
    }

    const sourceId = isString(connection.sourceComponentId)
      ? connection.sourceComponentId
      : isString(connection.source)
        ? toId(connection.source)
        : "";
    const targetId = isString(connection.targetComponentId)
      ? connection.targetComponentId
      : isString(connection.target)
        ? toId(connection.target)
        : "";
    const sourceComponent = componentById.get(sourceId) ?? (isString(connection.source) ? componentByName.get(connection.source) : undefined);
    const targetComponent = componentById.get(targetId) ?? (isString(connection.target) ? componentByName.get(connection.target) : undefined);

    if (!sourceComponent || !targetComponent) {
      throw new Error(`Connection ${index + 1} references a missing component.`);
    }

    return {
      id: isString(connection.id) ? connection.id : `conn_${index + 1}_${sourceComponent.id}_to_${targetComponent.id}`,
      sourceComponentId: sourceComponent.id,
      sourcePortId: isString(connection.sourcePortId) ? connection.sourcePortId : firstPortId(sourceComponent),
      targetComponentId: targetComponent.id,
      targetPortId: isString(connection.targetPortId) ? connection.targetPortId : firstPortId(targetComponent)
    };
  });
}

export function parseArchitectureModel(text: string): ArchitectureModel {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The input is not valid JSON.");
  }

  if (!isRecord(parsed)) {
    throw new Error("JSON must contain components and connections[].");
  }

  const components = normalizeComponents(parsed.components);
  const connections = normalizeConnections(parsed.connections, components);

  return { components, connections };
}
