import { createContext, ReactNode } from "react";

export interface IFlowContextProps {
  ToggleMenu: ReactNode;
}

export const LayoutPrivateContext = createContext({} as IFlowContextProps);
