import { ReactNode, createContext } from "react";

interface IFlowContextProps {
  ToggleMenu: ReactNode;
}

export const LayoutWorkbenchPageContext = createContext(
  {} as IFlowContextProps
);
