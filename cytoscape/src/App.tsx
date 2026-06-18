import { CytoscapeCanvas } from "./components/graph/CytoscapeCanvas";
import { GraphToolbar } from "./components/graph/GraphToolbar";
import { ModelImportPanel } from "./components/import/ModelImportPanel";
import { InspectorPanel } from "./components/inspector/InspectorPanel";
import { SearchBar } from "./components/search/SearchBar";
import { ExportButton } from "./components/ui/ExportButton";
import { KeyboardShortcutsHelp } from "./components/ui/KeyboardShortcutsHelp";
import { Legend } from "./components/ui/Legend";
import { Minimap } from "./components/ui/Minimap";
import { NodeTooltip } from "./components/ui/NodeTooltip";
import { useElkLayout } from "./hooks/useElkLayout";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useArchitectureStore } from "./store/architectureStore";

export function App() {
  const hasModel = useArchitectureStore((state) => state.model !== null);
  const componentCount = useArchitectureStore((state) => state.model?.components.length ?? 0);
  const connectionCount = useArchitectureStore((state) => state.model?.connections.length ?? 0);

  useElkLayout();
  useKeyboardShortcuts();

  return (
    <main className="flex h-screen overflow-hidden bg-shell-950 text-slate-100">
      <section className="relative min-w-0 flex-1">
        <div className="absolute left-5 top-5 z-10 flex items-start gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-50">ip-xact</h1>
            <p className="mt-1 text-xs text-slate-500">
              {componentCount} components / {connectionCount} connections
            </p>
          </div>
          <SearchBar />
        </div>
        <CytoscapeCanvas />
        <GraphToolbar />
        {hasModel && (
          <>
            <Legend />
            <Minimap />
          </>
        )}
        {!hasModel ? <ModelImportPanel /> : null}
        <NodeTooltip />
      </section>
      <InspectorPanel />
    </main>
  );
}
