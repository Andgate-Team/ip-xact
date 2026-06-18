import { useEffect, useRef } from "react";
import { instanceManager } from "../../lib/cytoscape/instanceManager";

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = 180;
    const HEIGHT = 120;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let animFrame: number;

    const draw = () => {
      const cy = instanceManager.getInstance();
      if (!cy) {
        animFrame = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.fillStyle = "#0b1018";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const bb = cy.elements().boundingBox();
      const pad = 20;
      const scaleX = (WIDTH - pad * 2) / (bb.w || 1);
      const scaleY = (HEIGHT - pad * 2) / (bb.h || 1);
      const scale = Math.min(scaleX, scaleY, 1);

      const offsetX = pad + (WIDTH - pad * 2 - bb.w * scale) / 2;
      const offsetY = pad + (HEIGHT - pad * 2 - bb.h * scale) / 2;

      cy.nodes().forEach((node) => {
        const pos = node.position();
        const x = (pos.x - bb.x1) * scale + offsetX;
        const y = (pos.y - bb.y1) * scale + offsetY;
        const w = (node.width() || 10) * scale;
        const h = (node.height() || 5) * scale;

        ctx.fillStyle = "#3b82f6";
        ctx.globalAlpha = 0.6;
        ctx.fillRect(x - w / 2, y - h / 2, Math.max(w, 2), Math.max(h, 2));
      });

      ctx.globalAlpha = 1;

      const extent = cy.extent();
      const vx1 = (extent.x1 - bb.x1) * scale + offsetX;
      const vy1 = (extent.y1 - bb.y1) * scale + offsetY;
      const vx2 = (extent.x2 - bb.x1) * scale + offsetX;
      const vy2 = (extent.y2 - bb.y1) * scale + offsetY;

      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(vx1, vy1, vx2 - vx1, vy2 - vy1);

      ctx.fillStyle = "rgba(34, 211, 238, 0.08)";
      ctx.fillRect(vx1, vy1, vx2 - vx1, vy2 - vy1);

      animFrame = requestAnimationFrame(draw);
    };

    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <div className="absolute bottom-5 right-5 z-10 rounded-lg border border-white/10 bg-shell-900/90 p-2 backdrop-blur-sm">
      <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Minimap</div>
      <canvas
        ref={canvasRef}
        className="cursor-pointer rounded border border-white/5"
        onClick={(e) => {
          const cy = instanceManager.getInstance();
          if (!cy) return;

          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const clickY = e.clientY - rect.top;

          const bb = cy.elements().boundingBox();
          const pad = 20;
          const scaleX = (180 - pad * 2) / (bb.w || 1);
          const scaleY = (120 - pad * 2) / (bb.h || 1);
          const scale = Math.min(scaleX, scaleY, 1);

          const offsetX = pad + (180 - pad * 2 - bb.w * scale) / 2;
          const offsetY = pad + (120 - pad * 2 - bb.h * scale) / 2;

          const worldX = (clickX - offsetX) / scale + bb.x1;
          const worldY = (clickY - offsetY) / scale + bb.y1;

          cy.animate({
            center: { eles: cy.elements(), x: worldX, y: worldY },
            duration: 300
          } as any);
        }}
      />
    </div>
  );
}
