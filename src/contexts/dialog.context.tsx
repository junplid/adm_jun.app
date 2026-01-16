import { ReactNode, createContext } from "react";

export interface IDialogContext {
  onOpen: (props: { content: ReactNode }) => void;
  close: () => void;
}

export const DialogContext = createContext({} as IDialogContext);
