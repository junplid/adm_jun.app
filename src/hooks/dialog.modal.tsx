import { ReactNode, useState } from "react";
import { DialogRoot } from "@components/ui/dialog";

interface IDialogModal {
  placement?: "bottom" | "center" | "top";
  motionPreset?:
    | "slide-in-bottom"
    | "scale"
    | "slide-in-top"
    | "slide-in-left"
    | "slide-in-right"
    | "none";
}

export const useDialogModal = ({
  motionPreset = "slide-in-bottom",
  placement = "top",
}: IDialogModal) => {
  const [dialog, setDialog] = useState<{
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
  } | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const onOpen = (props: {
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
  }) => {
    setDialog(props);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setDialog(null);
    }, 300);
  };

  return {
    dialog: (
      <DialogRoot
        defaultOpen={false}
        open={open}
        onOpenChange={(change) => setOpen(change.open)}
        placement={placement}
        motionPreset={motionPreset}
        lazyMount={true}
        unmountOnExit={true}
        size={dialog?.size}
      >
        {dialog?.content}
      </DialogRoot>
    ),
    onOpen,
    close,
  };
};
