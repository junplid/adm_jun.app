import Dexie, { Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";

export interface Variable {
  targetId?: number;
  id?: number;
  name: string;
}

class JunplidDatabase extends Dexie {
  variables!: Table<Variable, number>;

  constructor() {
    super("JunplidDatabase");
    this.version(1).stores({
      variables: "++targetId, id, name",
    });
  }
}

const db = new JunplidDatabase();

const useVariables = (): Variable[] =>
  useLiveQuery(() => db.variables.toArray(), []) || [];

export { db, useVariables };
