import { ReactNode, useState } from "react";
import {
  PopoverArrow,
  PopoverContent,
  PopoverRoot,
} from "@components/ui/popover";

export const usePopoverComponent = (props: { bg?: string }) => {
  const [popover, setPopover] = useState<{
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xs";
    boundingClientRect: any;
  } | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  const onOpen = (props: {
    content: ReactNode;
    size?: "sm" | "md" | "lg" | "xs";
    boundingClientRect: any;
  }) => {
    setPopover(props);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setPopover(null);
    }, 300);
  };

  return {
    popover: (
      <PopoverRoot
        open={open}
        onOpenChange={(s) => setOpen(s.open)}
        unmountOnExit
        lazyMount
        size={popover?.size}
        positioning={{
          flip: [
            "left",
            "right",
            "top",
            "top-end",
            "top-start",
            "bottom",
            "bottom-end",
            "bottom-start",
            "left-end",
            "left-start",
            "right-end",
            "right-start",
          ],
          placement: "left",
          getAnchorRect() {
            return popover?.boundingClientRect;
          },
        }}
      >
        <PopoverContent css={{ "--popover-bg": props.bg || "#474747" }}>
          <PopoverArrow />
          {popover?.content}
        </PopoverContent>
      </PopoverRoot>
    ),
    onOpen,
    close,
  };
};
