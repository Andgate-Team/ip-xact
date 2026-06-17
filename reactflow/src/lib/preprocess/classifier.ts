import type { Component, ComponentType, Connection } from "../../types";
import type { ComponentCategory, ComponentMetadata, LayoutLayer } from "./types";

interface ClassifyEntry {
  patterns: RegExp[];
  category: ComponentCategory;
}

const CLASSIFICATION_RULES: ClassifyEntry[] = [
  { patterns: [/\bcpu\b/i, /\bprocessor\b/i, /\briscv\b/i, /\barm\b/i, /\bmips\b/i, /\bcore\b/i], category: "cpu" },
  { patterns: [/\bdma\b/i], category: "dma" },
  { patterns: [/\binterrupt\b/i, /\bintc\b/i, /\bvic\b/i, /\bgic\b/i, /\bnvic\b/i], category: "interruptController" },
  { patterns: [/\bdebug\b/i, /\bjtag\b/i, /\btap\b/i, /\bdbg\b/i], category: "debug" },
  { patterns: [/\baxi\b/i, /\bahb\b/i, /\bapb\b/i, /\bwishbone\b/i, /\bbus\b/i, /\bfabric\b/i, /\bcrossbar\b/i], category: "bus" },
  { patterns: [/\bsram\b/i, /\bdram\b/i, /\brom\b/i, /\bflash\b/i, /\bmemory\b/i, /\bram\b/i, /\beeprom\b/i], category: "memory" },
  { patterns: [
    /\bgpio\b/i, /\buart\b/i, /\bspi\b/i, /\bi2c\b/i, /\btimer\b/i,
    /\bpwm\b/i, /\badc\b/i, /\bdac\b/i, /\bcan\b/i, /\beth\b/i,
    /\busb\b/i, /\bsdio\b/i, /\bmmc\b/i, /\bwatchdog\b/i, /\bwdt\b/i
  ], category: "peripheral" },
  { patterns: [/\bpad\b/i, /\binterface\b/i, /\bio\b/i, /\bpadframe\b/i], category: "interface" },
  { patterns: [/\bclock\b/i, /\breset\b/i, /\bclk\b/i, /\brst\b/i, /\bpll\b/i, /\boscillator\b/i], category: "clockReset" }
];

function matchCategory(name: string, rawType: string): ComponentCategory {
  const combined = `${name} ${rawType}`;
  for (const rule of CLASSIFICATION_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(combined)) {
        return rule.category;
      }
    }
  }

  const lower = rawType.trim().toLowerCase();
  if (lower === "bus") return "bus";
  if (lower === "cpu") return "cpu";
  if (lower === "memory") return "memory";
  if (lower === "interface") return "interface";
  if (lower === "clockreset" || lower === "clock_reset") return "clockReset";
  if (lower === "peripheral" || lower === "component") return "peripheral";
  if (lower === "dma") return "dma";
  if (lower === "interruptcontroller" || lower === "interrupt_controller") return "interruptController";
  if (lower === "debug") return "debug";

  return "custom";
}

const LAYER_MAP: Record<ComponentCategory, LayoutLayer> = {
  cpu: 0,
  bus: 1,
  memory: 2,
  dma: 2,
  peripheral: 4,
  interruptController: 5,
  interface: 6,
  clockReset: 6,
  debug: 6,
  custom: 3
};

function assignLayer(category: ComponentCategory, name: string, connections: Connection[]): LayoutLayer {
  if (category === "bus" && /\bapb\b/i.test(name)) {
    return 3;
  }

  if (category === "bus") {
    const componentId = name;
    const connectedToPeripherals = connections.some(
      (c) =>
        (c.sourceComponentId === componentId || c.targetComponentId === componentId) &&
        connections.some(
          (c2) =>
            c2.sourceComponentId !== componentId &&
            c2.targetComponentId !== componentId &&
            (c2.sourceComponentId === c.targetComponentId || c2.sourceComponentId === c.sourceComponentId ||
              c2.targetComponentId === c.targetComponentId || c2.targetComponentId === c.sourceComponentId)
        )
    );
    if (connectedToPeripherals) return 3;
  }

  return LAYER_MAP[category];
}

export function classifyComponents(
  components: Component[],
  connections: Connection[]
): Map<string, ComponentMetadata> {
  const result = new Map<string, ComponentMetadata>();

  for (const comp of components) {
    const category = matchCategory(comp.name, comp.type);
    const layer = assignLayer(category, comp.id, connections);
    result.set(comp.id, {
      category,
      layer,
      groupId: null
    });
  }

  return result;
}
