import clsx from "clsx";
import { memo, type CSSProperties } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { nodeColorMap } from "../../../lib/transform/colorMap";
import type { ArchitectureNodeData, BusChannelNodeData } from "../../../types";
import { useNodeHighlighting } from "../../../hooks/useNodeHighlighting";

const BUS_CHANNEL_WIDTH = 32;
const BUS_CHANNEL_HEIGHT = 720;

function BusChannelNodeComponent({ id, data }: NodeProps<ArchitectureNodeData>) {
  if (data.kind !== "busChannel") return null;

  const busData = data as BusChannelNodeData;
  const colors = nodeColorMap[busData.component.type];
  const { isSelected, isDimmed } = useNodeHighlighting(id);

  return (
    <div
      className={clsx(
        "bus-channel-node group relative transition duration-150",
        isDimmed && "opacity-30 grayscale"
      )}
      style={
        {
          width: BUS_CHANNEL_WIDTH,
          height: BUS_CHANNEL_HEIGHT,
          "--bus-color": colors.base,
          "--bus-border": colors.border,
          "--bus-glow": colors.glow
        } as CSSProperties
      }
    >
      <Handle
        className="!h-3 !w-1 !rounded-full !border-0 !bg-slate-500 hover:!bg-cyan-400"
        id={`left:${id}`}
        type="target"
        position={Position.Left}
        style={{ top: "50%" }}
      />
      <Handle
        className="!h-3 !w-1 !rounded-full !border-0 !bg-slate-500 hover:!bg-cyan-400"
        id={`right:${id}`}
        type="source"
        position={Position.Right}
        style={{ top: "50%" }}
      />

      <div
        className={clsx(
          "absolute inset-0 rounded-md border transition-all duration-150",
          isSelected && "ring-2 ring-cyan-200/70 shadow-lg"
        )}
        style={{
          backgroundColor: `${colors.base}30`,
          borderColor: isSelected ? colors.border : `${colors.base}60`,
          boxShadow: isSelected ? `0 0 20px ${colors.glow}` : "none"
        }}
      >
        <div
          className="absolute left-0 top-0 h-1 w-full rounded-t-md"
          style={{ backgroundColor: colors.base }}
        />
        <div
          className="absolute bottom-0 left-0 h-1 w-full rounded-b-md"
          style={{ backgroundColor: colors.base }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[8px] font-black"
              style={{ borderColor: colors.border, color: colors.border, backgroundColor: `${colors.base}20` }}
            >
              BUS
            </div>
            <span className="text-xs font-semibold" style={{ color: colors.text }}>
              {busData.component.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export const BusChannelNode = memo(BusChannelNodeComponent, (previous, next) => {
  if (previous.id !== next.id) return false;
  if (previous.selected !== next.selected) return false;
  if (previous.data.kind !== "busChannel" || next.data.kind !== "busChannel") return false;
  const prev = previous.data as BusChannelNodeData;
  const nextData = next.data as BusChannelNodeData;
  return (
    prev.component.id === nextData.component.id &&
    prev.component.name === nextData.component.name &&
    prev.component.type === nextData.component.type &&
    prev.layer === nextData.layer
  );
});
