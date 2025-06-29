import { ReactNode, createContext } from "react";

interface IIntegrationsContextProps {
  ToggleMenu: ReactNode;
}

export const LayoutIntegrationsPageContext = createContext(
  {} as IIntegrationsContextProps
);
