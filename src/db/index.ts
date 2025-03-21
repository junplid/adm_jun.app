import Dexie, { Table } from "dexie";

export interface Variable {
  id?: number;
  name: string;
}

class MyDatabase extends Dexie {
  variables!: Table<Variable, number>;

  constructor() {
    super("MyDatabase");
    this.version(1).stores({
      variables: "++id, name",
    });
  }
}

export const db = new MyDatabase();
