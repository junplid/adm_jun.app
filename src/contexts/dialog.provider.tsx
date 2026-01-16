import { ReactNode, useState } from "react";
import { DialogRoot } from "@components/ui/dialog";
import { DialogContext } from "./dialog.context";

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialog, setDialog] = useState<{
    content: ReactNode;
  } | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const onOpen = (props: { content: ReactNode }) => {
    setDialog(props);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setDialog(null);
  };

  return (
    <DialogContext.Provider value={{ onOpen, close }}>
      {children}
      <DialogRoot
        defaultOpen={false}
        open={open}
        onOpenChange={(change) => setOpen(change.open)}
        placement={"bottom"}
        motionPreset="slide-in-bottom"
        lazyMount
        unmountOnExit
      >
        {dialog?.content}
      </DialogRoot>
    </DialogContext.Provider>
  );
};
