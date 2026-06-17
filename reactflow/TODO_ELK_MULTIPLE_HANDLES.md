# TODO: ELKjs Multiple Handles (Ports)

- [ ] Inspect current ELK adapter: `flowToElkGraph` (how nodes/edges are translated to ELK).
- [ ] Inspect current ReactFlow node rendering: `ArchitectureNode` and whether handles are port-specific.
- [ ] Extend ReactFlow node component(s) to render `Handle`s for each `Port` with stable `id` (the handle/port id).
- [ ] Update the ELK graph conversion so that:
  - [ ] nodes include ELK port nodes with unique ids, each mapped to the correct side (left/right) depending on port direction.
  - [ ] edges reference `sources`/`targets` as ports using `port` constraints + `org.eclipse.elk.portConstraints = FIXED_ORDER`.
- [ ] Update transformation model → flow (`modelToFlow`) so that edges preserve `sourcePortId` and `targetPortId` (they already exist in `Connection`, but current aggregation edges may lose them).
- [ ] Update ELK adapter to emit `sources: [{ id, port }]` and `targets: [{ id, port }]`.
- [ ] Update/validate layout worker call and cached layout key (ensure port/handle changes don’t break cache).
- [ ] Run build/tests and visually verify reduced crossings.

