import { ReactNode, createContext } from "react";

interface IFlowContextProps {
  ToggleMenu: ReactNode;
}

export const LayoutInboxesPageContext = createContext({} as IFlowContextProps);
