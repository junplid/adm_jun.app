import { FC, ReactNode, useState } from "react";
import "./styles.css";

import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
  PopoverHeader,
  PopoverCloseTrigger,
} from "@components/ui/popover";
import { PatternNode } from ".";
import { PositioningOptions } from "@zag-js/popper";

interface PropsPatternNodeComponent {
  size?: string;
  title: string;
  description?: string;
  children: ReactNode;
  positioning?: PositioningOptions;
  node: {
    clickable?: boolean;
    isConnectable?: boolean;
    size?: string;
    name: string;
    description?: string;
    children: ReactNode;
  };
}

export const PatternNodePopoverComponent: FC<PropsPatternNodeComponent> = (
  props
) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverRoot
      lazyMount
      unmountOnExit
      open={open}
      portalled
      onOpenChange={(e) => setOpen(e.open)}
      // closeOnInteractOutside={false}
    >
      <PopoverTrigger>
        <PatternNode.PatternContainer
          open={open}
          nameNode={props.node.name}
          descriptionNode={props.node.description}
          clickable
          size={props.node.size}
          isConnectable={props.node.isConnectable}
        >
          {props.node.children}
        </PatternNode.PatternContainer>
      </PopoverTrigger>
      <PopoverContent
        w={props.size || "290px"}
        className="scroll-hidden overflow-y-scroll"
      >
        <PopoverHeader
          position={"sticky"}
          top={0}
          paddingTop={"15px"}
          paddingBottom={"5px"}
          className="dark:!bg-[#111111] !bg-[#fff] z-10 border border-white/5 rounded-md rounded-b-none border-b-0"
        >
          <PopoverTitle className="font-bold text-base">
            {props.title}
          </PopoverTitle>
          {!!props.description && (
            <PopoverDescription className="dark:text-white/60 text-black/70">
              {props.description}
            </PopoverDescription>
          )}
        </PopoverHeader>
        {/* <PopoverCloseTrigger /> */}
        <PopoverBody paddingTop={"18px"}>{props.children}</PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
