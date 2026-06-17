import Fuse from "fuse.js";
import { useMemo } from "react";
import { fuseOptions } from "../lib/search/fuseConfig";
import { useArchitectureStore } from "../store/architectureStore";
import { useSelectionStore } from "../store/selectionStore";
import type { Component } from "../types";

const EMPTY_COMPONENTS: Component[] = [];

export function useSearch(): Component[] {
  const components = useArchitectureStore((state) => state.model?.components ?? EMPTY_COMPONENTS);
  const query = useSelectionStore((state) => state.searchQuery);

  const fuse = useMemo(() => new Fuse(components, fuseOptions), [components]);

  return useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return components;
    }

    return fuse.search(trimmed).map((result) => result.item);
  }, [components, fuse, query]);
}
