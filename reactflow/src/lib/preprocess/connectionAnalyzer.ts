import type { Connection } from "../../types";
import type { ComponentMetadata, ConnectionMetadata, ConnectionType, PortSide } from "./types";

function classifyConnectionType(
  sourceMeta: ComponentMetadata | undefined,
  targetMeta: ComponentMetadata | undefined,
  sourcePortName: string,
  targetPortName: string
): ConnectionType {
  const sourceCat = sourceMeta?.category;
  const targetCat = targetMeta?.category;

  if (sourceCat === "clockReset" || targetCat === "clockReset") {
    const portName = `${sourcePortName} ${targetPortName}`.toLowerCase();
    if (/\brst\b|\breset\b|\bnrst\b/.test(portName)) return "reset";
    return "clock";
  }

  if (sourceCat === "interruptController" || targetCat === "interruptController") {
    return "interrupt";
  }

  if (sourceCat === "dma" || targetCat === "dma") {
    return "dma";
  }

  if (sourceCat === "debug" || targetCat === "debug") {
    return "debug";
  }

  if (sourceCat === "bus" || targetCat === "bus") {
    return "bus";
  }

  const allPorts = `${sourcePortName} ${targetPortName}`.toLowerCase();
  if (/\bctrl\b|\bcfg\b|\bconfig\b|\bstatus\b/.test(allPorts)) {
    return "control";
  }

  if (/\bdata\b|\btx\b|\brx\b|\btxd\b|\brxd\b|\bhwdata\b|\bhrdata\b|\bwdata\b|\brdata\b/.test(allPorts)) {
    return "data";
  }

  return "unknown";
}

function determinePortSides(
  connectionType: ConnectionType,
  sourceCat: ComponentMetadata["category"] | undefined,
  targetCat: ComponentMetadata["category"] | undefined,
  sourcePortName: string,
  targetPortName: string
): { sourcePortSide: PortSide; targetPortSide: PortSide } {
  if (connectionType === "clock") {
    return { sourcePortSide: "EAST", targetPortSide: "NORTH" };
  }
  if (connectionType === "reset") {
    return { sourcePortSide: "EAST", targetPortSide: "SOUTH" };
  }
  if (connectionType === "interrupt") {
    if (targetCat === "interruptController") {
      return { sourcePortSide: "EAST", targetPortSide: "WEST" };
    }
    return { sourcePortSide: "EAST", targetPortSide: "WEST" };
  }
  if (connectionType === "dma") {
    return { sourcePortSide: "EAST", targetPortSide: "WEST" };
  }
  if (connectionType === "debug") {
    return { sourcePortSide: "EAST", targetPortSide: "WEST" };
  }
  if (connectionType === "bus") {
    return { sourcePortSide: "EAST", targetPortSide: "WEST" };
  }

  const sp = sourcePortName.toLowerCase();
  const tp = targetPortName.toLowerCase();

  if (/\bout\b|\b_out\b|\b_o\b|\bm_\b|\bmaster\b/.test(sp)) {
    return { sourcePortSide: "EAST", targetPortSide: "WEST" };
  }
  if (/\bin\b|\b_in\b|\b_i\b|\bs_\b|\bslave\b/.test(tp)) {
    return { sourcePortSide: "EAST", targetPortSide: "WEST" };
  }

  return { sourcePortSide: "EAST", targetPortSide: "WEST" };
}

export function analyzeConnections(
  connections: Connection[],
  metadata: Map<string, ComponentMetadata>,
  componentPortNames: Map<string, Map<string, string>>
): Map<string, ConnectionMetadata> {
  const result = new Map<string, ConnectionMetadata>();

  for (const conn of connections) {
    const sourceMeta = metadata.get(conn.sourceComponentId);
    const targetMeta = metadata.get(conn.targetComponentId);

    const sourcePorts = componentPortNames.get(conn.sourceComponentId);
    const targetPorts = componentPortNames.get(conn.targetComponentId);
    const sourcePortName = sourcePorts?.get(conn.sourcePortId) ?? "";
    const targetPortName = targetPorts?.get(conn.targetPortId) ?? "";

    const connectionType = classifyConnectionType(sourceMeta, targetMeta, sourcePortName, targetPortName);
    const { sourcePortSide, targetPortSide } = determinePortSides(
      connectionType,
      sourceMeta?.category,
      targetMeta?.category,
      sourcePortName,
      targetPortName
    );

    result.set(conn.id, {
      connectionType,
      sourcePortSide,
      targetPortSide
    });
  }

  return result;
}
