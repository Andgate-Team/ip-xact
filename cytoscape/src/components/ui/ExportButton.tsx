import { useState } from "react";
import { IconButton } from "./IconButton";
import { instanceManager } from "../../lib/cytoscape/instanceManager";

export function ExportButton() {
  const [showMenu, setShowMenu] = useState(false);

  const exportPNG = () => {
    const cy = instanceManager.getInstance();
    if (!cy) return;

    const png = cy.png({ bg: "#06080d", full: true, scale: 2, maxWidth: 4096, maxHeight: 4096 });
    const link = document.createElement("a");
    link.href = png;
    link.download = `ip-xact-${Date.now()}.png`;
    link.click();
    setShowMenu(false);
  };

  const exportSVG = () => {
    const cy = instanceManager.getInstance();
    if (!cy) return;

    const svg = (cy as any).svg({ bg: "#06080d", full: true, scale: 2 });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ip-xact-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  const copyToClipboard = async () => {
    const cy = instanceManager.getInstance();
    if (!cy) return;

    const png = cy.png({ bg: "#06080d", full: true, scale: 1 });
    const response = await fetch(png);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <IconButton onClick={() => setShowMenu(!showMenu)} title="Export graph">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </IconButton>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-shell-900/95 shadow-xl backdrop-blur-sm">
            <button
              onClick={exportPNG}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Export as PNG
            </button>
            <button
              onClick={exportSVG}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as SVG
            </button>
            <button
              onClick={copyToClipboard}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy to clipboard
            </button>
          </div>
        </>
      )}
    </div>
  );
}
