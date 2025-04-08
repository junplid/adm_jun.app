import Dexie, { Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

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

  constructor() {
    super("JunplidDatabase");
    this.version(1).stores({
      variables: "++targetId, id, name",
      nodes: "id, label",
    });
  }
}

const db = new JunplidDatabase();

const useVariables = (): Variable[] =>
  useLiveQuery(() => db.variables.toArray(), []) || [];

const useDBNodes = (): Node[] =>
  useLiveQuery(() => db.nodes.toArray(), []) || [];

export { db, useVariables, useDBNodes };
