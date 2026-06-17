import { create } from "zustand";
import type { ArchitectureModel, Component, Connection } from "../types";

export interface ArchitectureLookups {
  componentById: Map<string, Component>;
  incomingByComponentId: Map<string, Connection[]>;
  outgoingByComponentId: Map<string, Connection[]>;
  edgeIdsByComponentId: Map<string, string[]>;
}

interface ArchitectureStore extends ArchitectureLookups {
  model: ArchitectureModel | null;
  loadModel: (model: ArchitectureModel) => void;
  getComponent: (id: string) => Component | undefined;
  getIncoming: (id: string) => Connection[];
  getOutgoing: (id: string) => Connection[];
}

function buildLookups(model: ArchitectureModel): ArchitectureLookups {
  const componentById = new Map(model.components.map((component) => [component.id, component]));
  const incomingByComponentId = new Map<string, Connection[]>();
  const outgoingByComponentId = new Map<string, Connection[]>();
  const edgeIdsByComponentId = new Map<string, string[]>();

  for (const component of model.components) {
    incomingByComponentId.set(component.id, []);
    outgoingByComponentId.set(component.id, []);
    edgeIdsByComponentId.set(component.id, []);
  }

  for (const connection of model.connections) {
    outgoingByComponentId.get(connection.sourceComponentId)?.push(connection);
    incomingByComponentId.get(connection.targetComponentId)?.push(connection);
    edgeIdsByComponentId.get(connection.sourceComponentId)?.push(connection.id);
    edgeIdsByComponentId.get(connection.targetComponentId)?.push(connection.id);
  }

  return { componentById, incomingByComponentId, outgoingByComponentId, edgeIdsByComponentId };
}

const emptyLookups = buildLookups({ components: [], connections: [] });
const EMPTY_CONNECTIONS: Connection[] = [];

export const useArchitectureStore = create<ArchitectureStore>((set, get) => ({
  model: null,
  ...emptyLookups,
  loadModel: (model) => set({ model, ...buildLookups(model) }),
  getComponent: (id) => get().componentById.get(id),
  getIncoming: (id) => get().incomingByComponentId.get(id) ?? EMPTY_CONNECTIONS,
  getOutgoing: (id) => get().outgoingByComponentId.get(id) ?? EMPTY_CONNECTIONS
}));
