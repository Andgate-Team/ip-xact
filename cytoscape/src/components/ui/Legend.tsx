import { nodeColorMap } from "../../lib/transform/colorMap";
import type { ComponentType } from "../../types";

const legendItems: { type: ComponentType; label: string }[] = [
  { type: "cpu", label: "CPU" },
  { type: "bus", label: "Bus" },
  { type: "memory", label: "Memory" },
  { type: "peripheral", label: "Peripheral" },
  { type: "interface", label: "Interface" },
  { type: "clockReset", label: "Clock/Reset" },
  { type: "dma", label: "DMA" },
  { type: "interruptController", label: "Interrupt" },
  { type: "debug", label: "Debug" },
  { type: "custom", label: "Custom" },
];

export function Legend() {
  return (
    <div className="absolute bottom-5 left-5 z-10 rounded-lg border border-white/10 bg-shell-900/90 p-3 backdrop-blur-sm">
      <div className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Legend</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {legendItems.map(({ type, label }) => {
          const colors = nodeColorMap[type];
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm border"
                style={{
                  backgroundColor: colors.fill,
                  borderColor: colors.border,
                }}
              />
              <span className="text-[11px] text-slate-400">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
