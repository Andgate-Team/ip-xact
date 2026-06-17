# ip-xact

A React Flow hardware architecture explorer for IP-XACT-like SoC models.

## Run

```bash
npm install
npm run dev
```

The app loads `src/data/sample-architecture.json` by default.

## Model Shape

```ts
type ArchitectureModel = {
  components: {
    id: string;
    name: string;
    type: "cpu" | "bus" | "memory" | "peripheral" | "interface" | "clockReset" | "custom";
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

## Notes

- ELK layout runs in `src/lib/elk/layoutWorker.ts` and is cached by graph signature.
- Only one node expands at a time.
- Search, inspector links, and canvas clicks all share the same node selection path.
