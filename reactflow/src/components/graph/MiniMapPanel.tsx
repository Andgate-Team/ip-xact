import { MiniMap } from "reactflow";

export function MiniMapPanel() {
  return (
    <MiniMap
      className="!border !border-white/10 !bg-shell-950/90"
      maskColor="rgba(2, 6, 23, 0.58)"
      nodeBorderRadius={8}
      nodeColor="#334155"
      pannable
      zoomable
    />
  );
}
