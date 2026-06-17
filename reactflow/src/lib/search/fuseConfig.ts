import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import type { Component } from "../../types";

export const fuseOptions: IFuseOptions<Component> = {
  keys: ["name", "type", "id"],
  threshold: 0.32,
  ignoreLocation: true,
  includeScore: true
};
