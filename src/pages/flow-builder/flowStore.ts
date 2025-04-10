import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { type AppState } from "./types";
import { type AppNode } from "./types";
import { nanoid } from "nanoid";
import { db } from "../../db";

const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  changes: { edges: [], nodes: [] },
  setChange: (
    type: "nodes" | "edges",
    change: { type: "upset" | "delete"; id: string }
  ) => {
    const changes = get().changes[type];
    const isChange = changes.find((s) => s.id === change.id);
    if (isChange) {
      set({
        changes: {
          ...get().changes,
          [type]: changes.map((s) => {
            if (s.id === change.id) s.type = change.type;
            return s;
          }),
        },
      });
    } else {
      set({
        changes: { ...get().changes, [type]: [...changes, change] },
      });
    }
  },
  resetChanges: () => {
    set({ changes: { edges: [], nodes: [] } });
  },
  onNodesChange: (changes) => {
    if (changes[0].type === "add") {
      get().setChange("nodes", {
        type: "upset",
        id: changes[0].item.id,
      });
    }
    if (changes[0].type === "remove") {
      get().setChange("nodes", {
        type: "delete",
        id: changes[0].id,
      });
    }
    if (changes[0].type === "dimensions") {
      get().setChange("nodes", {
        type: "upset",
        id: changes[0].id,
      });
    }
    if (changes[0].type === "position") {
      get().setChange("nodes", {
        type: "upset",
        id: changes[0].id,
      });
    }
    if (changes[0].type === "replace") {
      get().setChange("nodes", {
        type: "upset",
        id: changes[0].id,
      });
    }
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    const isColor = /\s/.test(connection.sourceHandle ?? "");
    set({
      edges: addEdge(
        {
          ...connection,
          type: "customedge",
          style: {
            stroke: isColor
              ? connection.sourceHandle?.split(/\s/)[0]
              : "#7E7D7D",
            strokeWidth: 2,
          },
        },
        get().edges
      ),
    });

    const lastEdgeId = get().edges[get().edges.length - 1]?.id;
    get().setChange("edges", { type: "upset", id: lastEdgeId });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  onNodesDelete: (nodesToDelete) => {
    set({
      nodes: get().nodes.filter(
        (s) => !nodesToDelete.find((n) => s.id === n.id)?.deletable
      ),
    });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  updateNode: (nodeId: string, node: AppNode) => {
    get().setChange("nodes", { type: "upset", id: nodeId });
    const { data, ...rest } = node;
    db.nodes.update(nodeId, { data: { ...data } });
    set({
      nodes: get().nodes.map((nodeX) => {
        if (nodeX.id === nodeId) {
          return { ...nodeX, ...rest };
        }
        return nodeX;
      }),
    });
  },
  getEdgesNode: (nodeId: string) => {
    const edges = get().edges.filter(
      (s) => s.target === nodeId || s.source === nodeId
    );
    return edges;
  },
  addNode: (node: Omit<AppNode, "id">) => {
    const newNode = { ...node, id: nanoid() };
    get().setChange("nodes", { type: "upset", id: newNode.id });
    set({ nodes: [...get().nodes, newNode] });
  },
  onEdgeClick: (event, edge) => {
    event.stopPropagation();
    get().setChange("edges", { type: "delete", id: edge.id });
    set({ edges: get().edges.filter((e) => e.id !== edge.id) });
  },
}));

export default useStore;
