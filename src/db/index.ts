import Dexie, { Table } from "dexie";

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

export const db = new JunplidDatabase();
