import Dexie, { Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { TagType } from "../services/api/Tag";

interface Node {
  id: string;
  data: any;
}

interface Variable {
  targetId?: number;
  id?: number;
  type: "dynamics" | "constant" | "system";
  name: string;
}

interface Tags {
  targetId?: number;
  id?: number;
  type: TagType;
  name: string;
}

interface Flows {
  targetId?: number;
  id?: string;
  type: "marketing" | "chatbot" | "universal";
  name: string;
}

class JunplidDatabase extends Dexie {
  variables!: Table<Variable, number>;
  nodes!: Table<Node, string>;
  tags!: Table<Tags, number>;
  flows!: Table<Flows, string>;

  constructor() {
    super("JunplidDatabase");
    this.version(1).stores({
      variables: "++targetId, id, type, name",
      tags: "++targetId, id, type, name",
      flows: "++targetId, id, type, name",
      nodes: "id, label",
    });
  }
}

const db = new JunplidDatabase();

const useVariables = (): Variable[] =>
  useLiveQuery(() => db.variables.toArray(), []) || [];

const useTags = (): Tags[] => useLiveQuery(() => db.tags.toArray(), []) || [];

const useFlows = (): Flows[] =>
  useLiveQuery(() => db.flows.toArray(), []) || [];

const useDBNodes = (): Node[] =>
  useLiveQuery(() => db.nodes.toArray(), []) || [];

export { db, useVariables, useDBNodes, useTags, useFlows };
