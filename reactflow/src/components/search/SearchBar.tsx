import { useEffect, useState } from "react";
import { useFitViewOnSelect } from "../../hooks/useFitViewOnSelect";
import { useSearch } from "../../hooks/useSearch";
import { useSelectionStore } from "../../store/selectionStore";
import { Panel } from "../ui/Panel";
import { SearchResultsList } from "./SearchResultsList";

export function SearchBar() {
  const [value, setValue] = useState("");
  const setSearchQuery = useSelectionStore((state) => state.setSearchQuery);
  const results = useSearch();
  const focusNode = useFitViewOnSelect();

  useEffect(() => {
    const timeout = window.setTimeout(() => setSearchQuery(value), 150);
    return () => window.clearTimeout(timeout);
  }, [setSearchQuery, value]);

  return (
    <Panel className="w-[360px] overflow-hidden rounded-lg">
      <label className="block px-3 pt-3 text-[11px] font-semibold uppercase text-slate-500">Search architecture</label>
      <input
        className="w-full border-0 bg-transparent px-3 pb-3 pt-2 text-sm text-slate-100 outline-none placeholder:text-slate-600"
        onChange={(event) => setValue(event.target.value)}
        placeholder="CPU, AXI, UART, memory..."
        value={value}
      />
      {value.trim() ? <SearchResultsList results={results} onSelect={focusNode} /> : null}
    </Panel>
  );
}
