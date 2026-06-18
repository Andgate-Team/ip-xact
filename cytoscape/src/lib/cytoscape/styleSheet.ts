import { nodeColorMap, buildCytoscapeColorStyles } from "../transform/colorMap";
import { getNodeIconDataUri } from "../transform/nodeIcon";

const typeStyles = buildCytoscapeColorStyles(nodeColorMap);

const baseNodeStyles = [
  {
    selector: "node",
    style: {
      shape: "rectangle",
      width: 220,
      height: 88,
      label: "data(label)",
      "text-valign": "center",
      "text-halign": "center",
      "font-size": 13,
      "font-weight": "bold",
      "text-outline-width": 2,
      "text-outline-color": "#0d1117",
      "text-wrap": "ellipsis",
      "text-max-width": 200,
      "border-width": 2,
      "border-opacity": 1,
      "padding-left": 5,
      "padding-right": 5,
      "padding-top": 5,
      "padding-bottom": 5,
      "overlay-opacity": 0,
      "z-index": 10
    }
  },
  ...typeStyles.map((style: any) => ({
    selector: style.selector,
    style: {
      ...style.style,
      "background-image": getNodeIconDataUri(
        (style.selector.match(/type = "(\w+)"/)?.[1] ?? "custom") as any
      ),
      "background-width": 20,
      "background-height": 20,
      "background-position-x": 8,
      "background-position-y": 34
    }
  }))
];

const edgeStyles = [
  {
    selector: "edge",
    style: {
      width: 1.5,
      "line-color": "#64748b",
      "target-arrow-color": "#64748b",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      "target-distance-from-node": 2,
      "source-distance-from-node": 2,
      opacity: 0.8,
      "z-index": 5,
      label: "data(label)",
      "font-size": 10,
      "font-weight": "normal",
      "text-rotation": "autorotate",
      "text-margin-x": 10,
      "text-margin-y": -10,
      color: "#94a3b8",
      "text-outline-width": 2,
      "text-outline-color": "#0d1117",
      "text-opacity": 0.9
    }
  }
];

const interactionStyles = [
  {
    selector: ".highlighted",
    style: {
      opacity: 1,
      "z-index": 999
    }
  },
  {
    selector: ".highlighted node",
    style: {
      opacity: 1,
      "z-index": 999,
      "border-width": 3
    }
  },
  {
    selector: ".highlighted edge",
    style: {
      opacity: 1,
      "line-color": "#f0883e",
      "target-arrow-color": "#f0883e",
      width: 2.5,
      "z-index": 999
    }
  },
  {
    selector: ".dimmed",
    style: {
      opacity: 0.15
    }
  },
  {
    selector: "node:selected",
    style: {
      "border-width": 3,
      "border-opacity": 1,
      "overlay-opacity": 0.1
    }
  }
];

export const cytoscapeStylesheet: any[] = [
  ...baseNodeStyles,
  ...edgeStyles,
  ...interactionStyles
];
