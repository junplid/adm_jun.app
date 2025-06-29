import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";
import { type AppState } from "./types";
import { type AppNode } from "./types";
import { db } from "../../db";
// import { nanoid } from "nanoid";

const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  businessIds: [],
  changes: { edges: [], nodes: [] },
  isPull: false,
  setIsPull: (v) => set({ isPull: v }),
  setBusinessIds: (businessIds: number[]) => {
    set({ businessIds });
  },
  setChange: (
    type: "nodes" | "edges",
    change: { type: "upset" | "delete"; id: string }
  ) => {
    if (!get().isPull) return;
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
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
    // changes.forEach((c) => {
    //   if (c.type === "remove") {
    //     get().setChange("nodes", { type: "delete", id: c.id });
    //     return;
    //   }

    //   // add, replace, dimensions, position, etc.
    //   // @ts-expect-error
    //   const id = "item" in c && c.item ? c.item.id : c.id;
    //   get().setChange("nodes", { type: "upset", id });
    // });
    if (changes.length > 1) return;
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
    // set({
    //   nodes: applyNodeChanges(changes, get().nodes),
    // });
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
          // aparentemente ta vindo o srourceHandle definido.
          // id: connection.sourceHandle || nanoid(),
          type: "customedge",
          animated: connection.sourceHandle?.includes("animated"),
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
      edges: get().edges.filter(
        (s) =>
          !nodesToDelete.find(
            (n) =>
              s.source === n.id ||
              s.target === n.id ||
              s.sourceHandle === n.id ||
              s.targetHandle === n.id
          )?.deletable
      ),
    });
  },
  setEdges: (edges) => {
    set({
      edges: edges.map((s) => ({
        ...s,
        style: {
          stroke: s.sourceHandle?.split(/\s/)[0] ?? "#7E7D7D",
          strokeWidth: 2,
        },
        type: "customedge",
      })),
    });
  },
  updateNode: (nodeId: string, node: AppNode) => {
    get().setChange("nodes", { type: "upset", id: nodeId });
    const { data, ...rest } = node;
    db.nodes.update(nodeId, { data });
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
  delNode: (id: string) => {
    const edgesIds = get()
      .getEdgesNode(id)
      .map((s) => s.id);
    get().setChange("nodes", { type: "delete", id });
    for (const edgeId of edgesIds) {
      get().setChange("edges", { type: "delete", id: edgeId });
    }
    set({
      nodes: get().nodes.filter((s) => s.id !== id),
      edges: get().edges.filter((s) => !edgesIds.includes(s.id)),
    });
  },
  getNodePreview: (id: string) => {
    const node = get().nodes.find((s) => s.id === id);
    return node?.preview;
  },
  delEdge: (id: string) => {
    get().setChange("edges", { type: "delete", id });
    set({ edges: get().edges.filter((s) => s.sourceHandle !== id) });
  },
  // addNode: (node: Omit<AppNode, "id">) => {
  //   const newNode = { ...node, id: nanoid() };
  //   if (node.type === "")

  //   get().setChange("nodes", { type: "upset", id: newNode.id });
  //   set({ nodes: [...get().nodes, newNode] });
  // },
  onEdgeClick: (event, edge) => {
    event.stopPropagation();
    get().setChange("edges", { type: "delete", id: edge.id });
    set({ edges: get().edges.filter((e) => e.id !== edge.id) });
  },
}));

export default useStore;
