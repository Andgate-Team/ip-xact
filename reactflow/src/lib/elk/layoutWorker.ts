import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkNode } from "elkjs";
import type { ELKLayoutHints } from "../preprocess/types";

const elk = new ELK();

self.onmessage = async (event: MessageEvent<{ graph: ElkNode; elkHints?: ELKLayoutHints }>) => {
  try {
    const layout = await elk.layout(event.data.graph);
    self.postMessage({ layout });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "ELK layout failed"
    });
  }
};

export {};
