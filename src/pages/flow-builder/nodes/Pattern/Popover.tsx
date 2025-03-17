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
} from "@components/ui/popover";
import { PatternNode } from ".";

interface PropsPatternNodeComponent {
  size?: string;
  title: string;
  description?: string;
  children: ReactNode;
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
      onOpenChange={(e) => setOpen(e.open)}
    >
      <PopoverTrigger>
        <PatternNode.PatternContainer
          open={open}
          nameNode={props.node.name}
          descriptionNode={props.node.description}
          clickable
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
        <PopoverBody paddingTop={"18px"}>{props.children}</PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};
