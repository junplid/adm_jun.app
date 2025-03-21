import { useLiveQuery } from "dexie-react-hooks";
import { db, Variable } from "../db";

export const useVariables = (): Variable[] =>
  useLiveQuery(() => db.variables.toArray(), []) || [];
