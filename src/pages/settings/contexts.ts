import { ReactNode, createContext } from "react";

interface IContextProps {
  ToggleMenu: ReactNode;
}

export const LayoutSettingsPageContext = createContext({} as IContextProps);
