import { useState } from "react";
import { IconButton } from "./IconButton";

const shortcuts = [
  { keys: ["Ctrl", "+"], action: "Zoom in" },
  { keys: ["Ctrl", "-"], action: "Zoom out" },
  { keys: ["Ctrl", "0"], action: "Fit to view" },
  { keys: ["Ctrl", "F"], action: "Focus search" },
  { keys: ["Esc"], action: "Reset view" },
  { keys: ["1"], action: "Zoom 30%" },
  { keys: ["2"], action: "Zoom 60%" },
  { keys: ["3"], action: "Zoom 100%" },
];

export function KeyboardShortcutsHelp() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <IconButton onClick={() => setShow(!show)} title="Keyboard shortcuts">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </IconButton>

      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-white/10 bg-shell-900/95 p-3 shadow-xl backdrop-blur-sm">
            <div className="mb-2 text-[11px] font-semibold uppercase text-slate-500">Keyboard Shortcuts</div>
            <div className="space-y-1.5">
              {shortcuts.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{shortcut.action}</span>
                  <div className="flex gap-1">
                    {shortcut.keys.map((key, j) => (
                      <kbd
                        key={j}
                        className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-slate-300"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
