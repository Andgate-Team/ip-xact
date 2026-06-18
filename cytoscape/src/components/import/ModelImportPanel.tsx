import { useState, type ChangeEvent } from "react";
import sampleArchitecture from "../../data/sample-architecture.json";
import { parseArchitectureModel } from "../../lib/validateArchitectureModel";
import { useArchitectureStore } from "../../store/architectureStore";
import { useGraphStore } from "../../store/graphStore";
import { useSelectionStore } from "../../store/selectionStore";
import type { ArchitectureModel } from "../../types";
import { Panel } from "../ui/Panel";

const sampleText = JSON.stringify(sampleArchitecture, null, 2);

export function ModelImportPanel() {
  const loadModel = useArchitectureStore((state) => state.loadModel);
  const setElements = useGraphStore((state) => state.setElements);
  const setLayoutLoading = useGraphStore((state) => state.setLayoutLoading);
  const selectNode = useSelectionStore((state) => state.selectNode);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const loadParsedModel = (model: ArchitectureModel) => {
    selectNode(null);
    setElements([]);
    setLayoutLoading(true);
    loadModel(model);
    setError(null);
  };

  const handleLoadText = () => {
    setIsParsing(true);
    setTimeout(() => {
      try {
        loadParsedModel(parseArchitectureModel(text));
      } catch (parseError) {
        setError(parseError instanceof Error ? parseError.message : "Unable to parse architecture JSON.");
        setLayoutLoading(false);
      } finally {
        setIsParsing(false);
      }
    }, 50);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsParsing(true);
    try {
      const contents = await file.text();
      setText(contents);
      loadParsedModel(parseArchitectureModel(contents));
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : "Unable to read architecture JSON file.");
      setLayoutLoading(false);
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSample = () => {
    setIsParsing(true);
    setTimeout(() => {
      setText(sampleText);
      loadParsedModel(parseArchitectureModel(sampleText));
      setIsParsing(false);
    }, 50);
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-shell-950/70 p-6 backdrop-blur-sm">
      <Panel className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-lg">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-semibold text-slate-50">Load architecture JSON</h2>
          <p className="mt-2 text-sm text-slate-400">
            Choose a JSON file or paste an architecture model to render the graph.
          </p>
        </div>

        <div className="grid gap-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15">
              {isParsing ? "Reading file..." : "Choose JSON file"}
              <input accept="application/json,.json" className="sr-only" onChange={handleFileChange} type="file" />
            </label>
            <button
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
              onClick={handleLoadSample}
              type="button"
            >
              Load sample SoC
            </button>
          </div>

          <textarea
            className="h-72 resize-none rounded-md border border-white/10 bg-shell-950 p-3 font-mono text-xs leading-5 text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-300/40"
            onChange={(event) => setText(event.target.value)}
            placeholder='{"components": [...], "connections": [...]}'
            spellCheck={false}
            value={text}
          />

          {error ? <div className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</div> : null}

          <div className="flex justify-end">
            <button
              className="rounded-md bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!text.trim() || isParsing}
              onClick={handleLoadText}
              type="button"
            >
              {isParsing ? "Processing..." : "Render graph"}
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
