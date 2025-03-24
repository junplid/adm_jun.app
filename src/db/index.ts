import Dexie, { Table } from "dexie";

export interface Variable {
  id?: number;
  _id?: number;
  name: string;
}

class JunplidDatabase extends Dexie {
  variables!: Table<Variable, number>;

  constructor() {
    super("JunplidDatabase");
    this.version(1).stores({
      variables: "++id, _id, name",
    });
  }
}

export const db = new JunplidDatabase();
