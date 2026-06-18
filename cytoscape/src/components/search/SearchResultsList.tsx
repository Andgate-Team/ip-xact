import type { Component } from "../../types";

interface SearchResultsListProps {
  results: Component[];
  onSelect: (id: string) => void;
}

export function SearchResultsList({ results, onSelect }: SearchResultsListProps) {
  return (
    <div className="max-h-72 overflow-y-auto border-t border-white/10">
      {results.map((component) => (
        <button
          key={component.id}
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-white/5"
          onClick={() => onSelect(component.id)}
          type="button"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-100">{component.name}</span>
            <span className="block font-mono text-[11px] text-slate-500">{component.id}</span>
          </span>
          <span className="shrink-0 rounded bg-white/5 px-2 py-0.5 text-[10px] uppercase text-slate-400">{component.type}</span>
        </button>
      ))}
    </div>
  );
}
