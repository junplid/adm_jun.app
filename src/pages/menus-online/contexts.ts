import { createContext } from "react";

interface IFlowContextProps {}

export const LayoutWorkbenchPageContext = createContext(
  {} as IFlowContextProps,
);
