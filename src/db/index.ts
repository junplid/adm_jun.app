import Dexie, { Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

import { type Edge as FlowEdge } from "@xyflow/react";

interface Node {
  id: string;
  data: any;
}

export interface Variable {
  targetId?: number;
  id?: number;
  name: string;
}

class JunplidDatabase extends Dexie {
  variables!: Table<Variable, number>;
  nodes!: Table<Node, string>;
  edges!: Table<FlowEdge, string>;

  constructor() {
    super("JunplidDatabase");
    this.version(1).stores({
      variables: "++targetId, id, name",
      nodes: "id, label",
      edges: "id, source, target",
    });
  }
}

const db = new JunplidDatabase();

const useVariables = (): Variable[] =>
  useLiveQuery(() => db.variables.toArray(), []) || [];

const useDBNodes = (): Node[] =>
  useLiveQuery(() => db.nodes.toArray(), []) || [];

const useDBEdges = (): FlowEdge[] =>
  useLiveQuery(() => db.edges.toArray(), []) || [];

export { db, useVariables, useDBNodes, useDBEdges };
