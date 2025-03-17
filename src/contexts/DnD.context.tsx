import {
  createContext,
  useState,
  Dispatch,
  SetStateAction,
  useMemo,
} from "react";
import { TypesNodes } from "../pages/flow-builder";

type TDnDContext = {
  type: TypesNodes | null;
  setType: Dispatch<SetStateAction<TypesNodes | null>>;
};

export const DnDContext = createContext<TDnDContext>({} as TDnDContext);

export const DnDProvider = ({ children }: any) => {
  const [type, setType] = useState<TypesNodes | null>(null);

  const data = useMemo(() => {
    return { type, setType };
  }, [type]);

  return <DnDContext.Provider value={data}>{children}</DnDContext.Provider>;
};
