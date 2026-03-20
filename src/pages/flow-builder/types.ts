import {
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  OnNodesDelete,
} from "@xyflow/react";
import { MouseEvent } from "react";
import { TypesNodes } from ".";

export type AppNode = Node & { preview?: any };

export type AppState = {
  changes: {
    nodes: { type: "upset" | "delete"; id: string }[];
    edges: { type: "upset" | "delete"; id: string }[];
  };
  typeDrag: null | TypesNodes;
  setTypeDrag: (type: null | TypesNodes) => void;
  nodes: AppNode[];
  edges: Edge[];
  businessIds: number[];
  isPull: boolean;
  setIsPull: (v: boolean) => void;
  setBusinessIds: (businessIds: number[]) => void;
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
  // addNode: (node: Omit<AppNode, "id">) => void;
  delNode: (id: string) => void;
  delEdge: (id: string) => void;
  resetChanges: () => void;
  onEdgeClick: (event: MouseEvent, edge: Edge) => void;
};
