import { create } from "zustand";
import type { CytoscapeElement } from "../types";

interface RenderProgress {
  current: number;
  total: number;
}

type LoadingPhase = "layout" | "render";

interface GraphStore {
  elements: CytoscapeElement[];
  currentLayout: string;
  isLayoutLoading: boolean;
  loadingPhase: LoadingPhase;
  renderProgress: RenderProgress | null;
  setElements: (elements: CytoscapeElement[]) => void;
  setLayoutLoading: (loading: boolean, phase?: LoadingPhase) => void;
  setLayout: (layout: string) => void;
  setRenderProgress: (progress: RenderProgress | null) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  elements: [],
  currentLayout: "preset",
  isLayoutLoading: false,
  loadingPhase: "layout",
  renderProgress: null,
  setElements: (elements) => set({ elements }),
  setLayoutLoading: (loading, phase = "layout") => set({ isLayoutLoading: loading, loadingPhase: phase }),
  setLayout: (layout) => set({ currentLayout: layout }),
  setRenderProgress: (progress) => set({ renderProgress: progress })
}));
