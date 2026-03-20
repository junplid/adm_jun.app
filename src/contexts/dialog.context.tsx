import { DialogRootProps } from "@chakra-ui/react";
import { ReactNode, createContext } from "react";

export interface IDialogContext {
  onOpen: (props: { content: ReactNode }) => void;
  propsDialog?: Omit<DialogRootProps, "children">;
  close: () => void;
}

export const DialogContext = createContext({} as IDialogContext);
