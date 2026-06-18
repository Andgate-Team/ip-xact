import { create } from "zustand";
import type { CytoscapeElement } from "../types";

interface RenderProgress {
  current: number;
  total: number;
}

interface GraphStore {
  elements: CytoscapeElement[];
  currentLayout: string;
  isLayoutLoading: boolean;
  renderProgress: RenderProgress | null;
  setElements: (elements: CytoscapeElement[]) => void;
  setLayoutLoading: (loading: boolean) => void;
  setLayout: (layout: string) => void;
  setRenderProgress: (progress: RenderProgress | null) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  elements: [],
  currentLayout: "preset",
  isLayoutLoading: false,
  renderProgress: null,
  setElements: (elements) => set({ elements }),
  setLayoutLoading: (loading) => set({ isLayoutLoading: loading }),
  setLayout: (layout) => set({ currentLayout: layout }),
  setRenderProgress: (progress) => set({ renderProgress: progress })
}));
