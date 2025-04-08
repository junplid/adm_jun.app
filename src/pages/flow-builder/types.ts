import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  OnNodesDelete,
} from "@xyflow/react";

export type AppNode = Node;

export type AppState = {
  changes: {
    nodes: { type: "upset" | "delete"; id: string }[];
    edges: { type: "upset" | "delete"; id: string }[];
  };
  nodes: AppNode[];
  edges: Edge[];
  setChange: (
    type: "nodes" | "edges",
    change: { type: "upset" | "delete"; id: string }
  ) => void;
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onNodesDelete: OnNodesDelete<AppNode>;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNode: (nodeId: string, node: any) => void;
  getEdgesNode: (nodeId: string) => Edge[];
  addNode: (node: Omit<AppNode, "id">) => void;
  resetChanges: () => void;
};
