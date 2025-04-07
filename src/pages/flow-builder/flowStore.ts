import { create } from "zustand";
import { addEdge, applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

import { type AppState } from "./types";

import { type AppNode } from "./types";
import { v4 } from "uuid";

export const initialNodes = [
  {
    id: "0",
    type: "nodeInitial",
    position: { x: 100, y: 200 },
    data: {},
    deletable: false,
  },
  { id: "1", type: "nodeMessage", position: { x: 100, y: 100 }, data: {} },
  { id: "2", type: "nodeReply", position: { x: 185, y: 100 }, data: {} },
  // { id: "3", type: "nodeAddTags", position: { x: 280, y: 100 }, data: {} },
  // { id: "4", type: "nodeRemoveTags", position: { x: 370, y: 100 }, data: {} },
  // { id: "5", type: "nodeAddVariables", position: { x: 460, y: 100 }, data: {} },
  // {
  //   id: "6",
  //   type: "nodeRemoveVariables",
  //   position: { x: 550, y: 100 },
  //   data: {},
  // },
  {
    id: "7",
    type: "nodeIF",
    position: { x: 635, y: 100 },
    data: {},
  },
  {
    id: "8",
    type: "nodeSendFlow",
    position: { x: 730, y: 100 },
    data: {},
  },

  //   { id: "2", type: "nodeMessage", position: { x: 190, y: 100 }, data: {} },
  //   { id: "3", type: "nodeMessage", position: { x: 280, y: 100 }, data: {} },
  //   { id: "5", type: "nodeMessage", position: { x: 370, y: 100 }, data: {} },
  //   { id: "6", type: "nodeMessage", position: { x: 460, y: 100 }, data: {} },
  //   { id: "7", type: "nodeMessage", position: { x: 550, y: 100 }, data: {} },
  //   { id: "8", type: "nodeMessage", position: { x: 640, y: 100 }, data: {} },
] as AppNode[];

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
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
          // type: ConnectionLineType.SmoothStep,
          // animated: isColor,
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
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  updateNode: (nodeId: string, node: Node) => {
    set({
      nodes: get().nodes.map((nodeX) => {
        if (nodeX.id === nodeId) {
          return { ...nodeX, ...node };
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
    set({ nodes: [...get().nodes, { ...node, id: v4() }] });
  },
}));

export default useStore;
