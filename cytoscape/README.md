# ip-xact-cytoscape

A Cytoscape.js-based hardware architecture explorer for IP-XACT-like SoC (System-on-Chip) models. Visualizes component hierarchies, port connections, and register maps with performance-optimized rendering for large-scale graphs.

## Features

- **Cytoscape.js rendering** with custom styling and node icons
- **ELK layered layout** for < 2000 components, falls back to force-directed (cose) for larger graphs
- **Progressive rendering** — chunks large graphs (500 elements at a time) to keep UI responsive
- **Level-of-detail (LOD)** — nodes/edges scale and show/hide based on zoom level
- **Viewport culling** — off-screen elements are hidden for performance
- **Keyboard shortcuts** — zoom, fit, search, and preset zoom levels
- **Search** with fuzzy matching (Fuse.js)
- **Inspector panel** showing component details, ports, registers, and connections
- **Minimap** and **legend** for orientation
- **Export** functionality
- **Node tooltips** on hover

## Tech Stack

- React 18 + TypeScript
- Cytoscape.js
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
│   ├── graph/        # CytoscapeCanvas, GraphToolbar, LoadingSkeleton
│   ├── import/       # ModelImportPanel
│   ├── inspector/    # InspectorPanel, ConnectionList
│   ├── search/       # SearchBar, SearchResultsList
│   └── ui/           # ExportButton, Legend, Minimap, NodeTooltip, etc.
├── hooks/            # useElkLayout, useKeyboardShortcuts, useSearch, etc.
├── lib/
│   ├── cytoscape/    # Adapter, ELK worker, instance manager, styles
│   ├── search/       # Fuse.js config
│   └── transform/    # Color map, node icons
├── store/            # Zustand stores (architecture, graph, selection)
└── types/            # TypeScript type definitions
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + =` | Zoom in |
| `Ctrl + -` | Zoom out |
| `Ctrl + 0` | Fit view |
| `Ctrl + F` | Focus search bar |
| `Escape` | Reset selection |
| `1` / `2` / `3` | Preset zoom levels |

## Notes

- Layout runs in the main thread via ELK.js; for graphs ≥ 2000 components, a force-directed (cose) layout is used instead
- The Cytoscape instance is managed through `instanceManager` singleton for cross-component access
- LOD rendering dynamically adjusts node size, label visibility, and edge display based on zoom
