import type { Component } from "../../types";
import type { ComponentMetadata, PortSide } from "./types";

const CLOCK_PATTERNS = /\bclk\b|\bclock\b|\bclk_i\b|\bclk_o\b|\bclk_in\b|\bclk_out\b/i;
const RESET_PATTERNS = /\brst\b|\breset\b|\brst_i\b|\brst_o\b|\brst_in\b|\brst_out\b|\bnrst\b/i;
const INPUT_PATTERNS = /\b_in\b|\b_i\b|\bs_\b|\bslave\b|\bawaddr\b|\bawvalid\b|\baraddr\b|\barvalid\b|\bwdata\b|\bwstrb\b|\bwvalid\b|\bhaddr\b|\bhwrite\b|\bhwdata\b|\bhsel\b|\bhtrans\b|\bhburst\b/i;
const OUTPUT_PATTERNS = /\b_out\b|\b_o\b|\bm_\b|\bmaster\b|\brdata\b|\brresp\b|\bhrdata\b|\bhready\b|\bhresp\b|\bawready\b|\barready\b|\bwready\b/i;

function classifyPort(name: string): PortSide {
  if (CLOCK_PATTERNS.test(name)) return "NORTH";
  if (RESET_PATTERNS.test(name)) return "SOUTH";
  if (OUTPUT_PATTERNS.test(name)) return "EAST";
  if (INPUT_PATTERNS.test(name)) return "WEST";
  return "WEST";
}

const CATEGORY_PORT_RULES: Record<string, { input: RegExp; output: RegExp; clock: RegExp; reset: RegExp }> = {
  cpu: { input: /irq|interrupt|debug|jtag/i, output: /bus|master|addr|data/i, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS },
  bus: { input: /slave|sel|paddr|pwrite/i, output: /master|ready|resp/i, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS },
  memory: { input: /addr|data_in|wen|ren|cs/i, output: /data_out|rdata/i, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS },
  peripheral: { input: /bus_in|paddr|pwrite|pwdata|psel|penable/i, output: /bus_out|irq|prdata/i, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS },
  dma: { input: /req|data_in|ack/i, output: /data_out|done/i, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS },
  interruptController: { input: /irq_in|fiq/i, output: /irq_out|nirq|nfiq/i, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS },
  clockReset: { input: /none/i, output: /clk_out|rst_out/i, clock: /xtal|osc|pll_in/i, reset: /por|brownout/i },
  interface: { input: /pad_in|di/i, output: /pad_out|do/i, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS },
  debug: { input: /jtag_in|tdi|tms/i, output: /jtag_out|tdo/i, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS },
  custom: { input: /.*/, output: /.*/, clock: CLOCK_PATTERNS, reset: RESET_PATTERNS }
};

export function assignPortSides(
  components: Component[],
  metadata: Map<string, ComponentMetadata>
): Record<string, Record<string, PortSide>> {
  const result: Record<string, Record<string, PortSide>> = {};

  for (const comp of components) {
    const meta = metadata.get(comp.id);
    const category = meta?.category ?? "custom";
    const rules = CATEGORY_PORT_RULES[category] ?? CATEGORY_PORT_RULES.custom;
    const portSides: Record<string, PortSide> = {};

    for (const port of comp.ports) {
      if (rules?.clock.test(port.name)) {
        portSides[port.id] = "NORTH";
      } else if (rules?.reset.test(port.name)) {
        portSides[port.id] = "SOUTH";
      } else if (port.direction === "out" || rules?.output.test(port.name)) {
        portSides[port.id] = "EAST";
      } else if (port.direction === "in" || rules?.input.test(port.name)) {
        portSides[port.id] = "WEST";
      } else {
        portSides[port.id] = classifyPort(port.name);
      }
    }

    result[comp.id] = portSides;
  }

  return result;
}
