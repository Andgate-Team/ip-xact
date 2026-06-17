# Implementation Plan: ELKjs Multiple Handles (Ports)

## Goal
Use ELK port nodes (“handles”) for edge routing to reduce crossings and enforce a deterministic order via:
- unique ELK port ids
- edge `sources`/`targets` that reference specific ports
- `org.eclipse.elk.portConstraints = FIXED_ORDER`

## Constraints from current code
- ELK adapter currently uses only node ids for sources/targets.
- ReactFlow node currently renders only 2 generic handles.
- Edge aggregation currently groups by component pair and loses port-level detail.

## Implementation steps

### 1) ReactFlow: render port-specific handles
**File:** `reactflow/src/components/graph/nodes/ArchitectureNode.tsx`
- For component nodes (kind === "component"), render a `<Handle>` per `component.ports[]`.
- Handle `id` must be stable and match ELK port ids.
  - Recommended: `handleId = `port:${component.id}:${port.id}``
- Set `type` on handles:
  - `direction === "in"` => `type="target"`
  - `direction === "out"` => `type="source"`
  - `direction === "inout"` => render both a target and source handle (same port id or distinct side ids—choose one consistent convention).
- Set `position`:
  - `in` => Left
  - `out` => Right
  - `inout` => both (left target + right source)
- Keep the existing generic handles only if needed for clusters; for component nodes, port handles will replace/augment generics.

### 2) Preserve port identity in graph edges
**File:** `reactflow/src/lib/transform/modelToFlow.ts`
- Update edge aggregation so edges are not collapsed only by component pair.
- Minimum requirement: preserve `sourcePortId` and `targetPortId` into the resulting `ArchitectureFlowEdge` so ELK can reference correct ports.
- Recommended approach:
  - Still aggregate counts, but aggregate key must include port ids:
    - key = `${sourceVisible}:${connection.sourcePortId}->${targetVisible}:${connection.targetPortId}`
  - Ensure resulting edge `id` remains stable for identical port pairs.

### 3) ELK adapter: build ELK port nodes + port references on edges
**File:** `reactflow/src/lib/elk/elkAdapter.ts`
- Enhance each ELK child node with `ports`:
  - `ports: [{ id: <unique>, side: "LEFT"|"RIGHT" }, ...]`
- Add layout option:
  - `"org.eclipse.elk.portConstraints": "FIXED_ORDER"`
  - (and if needed, `"org.eclipse.elk.edgePortConstraints": "FIXED_ORDER"` depending on ELK behavior)
- Update ELK edge mapping:
  - `sources: [{ id: edge.source, port: <sourcePortElkId> }]`
  - `targets: [{ id: edge.target, port: <targetPortElkId> }]`
- `edge.source` / `edge.target` should remain the node ids in ELK.

### 4) Cache key safety
**File:** `reactflow/src/lib/elk/layoutCache.ts` and/or `useElkLayout.ts`
- Ensure cache key changes if port mapping changes.
- Current cache key uses only node ids + connection ids; port changes should already change `connection.id` but we will confirm.

### 5) Validate
- Build and run.
- Check that ELK now uses multiple handles: edges visibly attach to different port spots.

## Notes
- Clusters: current node data for cluster doesn’t include ports; for cluster nodes we may keep generic handles or treat them as aggregated endpoints. Port routing is primarily for component nodes.

