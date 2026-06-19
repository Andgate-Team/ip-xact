# ip-xact

A React Flow-based hardware architecture explorer for IP-XACT-like SoC (System-on-Chip) models. Visualizes component hierarchies, port connections, and register maps with custom node types and ELK-powered layout.

## Features

- **React Flow rendering** with custom node and edge types
- **ELK layout** with caching by graph signature
- **Custom node types** — `architecture` (component nodes) and `busChannel` (bus/channel nodes)
- **Custom edge types** with directional arrows
- **MiniMap** panel for navigation
- **Search** with fuzzy matching (Fuse.js)
- **Inspector panel** showing component details, ports, registers, and connections
- **Cluster toggle** — double-click clusters to expand/collapse
- **Fit view on selection** — zooms to selected node
- **Loading skeleton** during layout computation
- **Overview mode** — automatically simplifies rendering at low zoom levels

## Tech Stack

- React 18 + TypeScript
- React Flow v11
- ELK.js (layered graph layout)
- Zustand (state management)
- Tailwind CSS
- Vite
- Fuse.js (fuzzy search)

## Run

```bash
npm install
npm run dev
```

## Model Shape

```ts
type ArchitectureModel = {
  components: {
    id: string;
    name: string;
    type: "cpu" | "bus" | "memory" | "peripheral" | "interface" | "clockReset" | "custom" | "dma" | "interruptController" | "debug";
    ports: { id: string; name: string; direction: "in" | "out" | "inout"; width?: number }[];
    registers: { id: string; name: string; address?: string; description?: string }[];
  }[];
  connections: {
    id: string;
    sourceComponentId: string;
    sourcePortId: string;
    targetComponentId: string;
    targetPortId: string;
  }[];
};
```

## Architecture

```
src/
├── components/
│   ├── graph/        # FlowCanvas, BackgroundGrid, MiniMapPanel, LoadingSkeleton
│   │   ├── edges/    # ArchitectureEdge, edgeTypeRegistry
│   │   └── nodes/    # ArchitectureNode, BusChannelNode, NodeHeader, nodeTypeRegistry
│   ├── import/       # ModelImportPanel
│   ├── inspector/    # InspectorPanel, ConnectionList, InspectorSection
│   ├── search/       # SearchBar, SearchResultsList
│   └── ui/           # IconButton, Panel, Badge
├── hooks/            # useElkLayout, useFitViewOnSelect, useSearch, etc.
├── lib/
│   ├── elk/          # ELK adapter, layout worker, grid layout, layout cache
│   ├── preprocess/   # Group detection, port assignment, edge optimization, classification
│   ├── clustering/   # Hierarchy builder
│   ├── search/       # Fuse.js config
│   └── transform/    # Color map, model-to-flow conversion
├── store/            # Zustand stores (architecture, graph, selection)
└── types/            # TypeScript type definitions
```

## Interaction

- **Single click** — select a component and show in inspector
- **Double-click** — expand cluster or zoom to fit node
- **Pane click** — deselect all
- **Drag** — reposition nodes

## Notes

- ELK layout runs in `src/lib/elk/layoutWorker.ts` and is cached by graph signature
- Only one cluster node expands at a time
- Search, inspector links, and canvas clicks all share the same node selection path
- The preprocessing pipeline (`src/lib/preprocess/`) classifies components, detects groups, assigns ports, and optimizes edges before layout
