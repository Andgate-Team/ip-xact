import { useEffect, useMemo, useState } from "react";
import { useFitViewOnSelect } from "../../hooks/useFitViewOnSelect";
import { Panel } from "../ui/Panel";
import { SearchResultsList } from "./SearchResultsList";
import Fuse from "fuse.js";
import { fuseOptions } from "../../lib/search/fuseConfig";
import { useArchitectureStore } from "../../store/architectureStore";
import type { Component } from "../../types";

const EMPTY_COMPONENTS: Component[] = [];
const DEBOUNCE_MS = 150;

export function SearchBar() {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  const focusNode = useFitViewOnSelect();
  const components = useArchitectureStore((state) => state.model?.components ?? EMPTY_COMPONENTS);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  const fuse = useMemo(() => new Fuse(components, fuseOptions), [components]);

  const results = useMemo(() => {
    const trimmed = debouncedValue.trim();
    if (!trimmed) return components;
    return fuse.search(trimmed).map((r) => r.item);
  }, [components, fuse, debouncedValue]);

  return (
    <Panel className="w-[360px] overflow-hidden rounded-lg">
      <label className="block px-3 pt-3 text-[11px] font-semibold uppercase text-slate-500">Search architecture</label>
      <input
        className="w-full border-0 bg-transparent px-3 pb-3 pt-2 text-sm text-slate-100 outline-none placeholder:text-slate-600"
        onChange={(event) => setValue(event.target.value)}
        placeholder="CPU, AXI, UART, memory..."
        value={value}
        data-search-input
      />
      {debouncedValue.trim() ? <SearchResultsList results={results} onSelect={focusNode} /> : null}
    </Panel>
  );
}
