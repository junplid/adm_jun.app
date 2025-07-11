import { Tooltip as ChakraTooltip, Portal } from "@chakra-ui/react";
import * as React from "react";
import { useColorModeValue } from "./color-mode";

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
  content: React.ReactNode;
  contentProps?: ChakraTooltip.ContentProps;
  disabled?: boolean;
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      contentProps,
      portalRef,
      openDelay = 80,
      closeDelay = 500,
      ...rest
    } = props;

    const bg = useColorModeValue("#6e7174", "#b1b3b8");

    if (disabled) return children;

    return (
      <ChakraTooltip.Root
        {...rest}
        openDelay={openDelay}
        closeDelay={closeDelay}
        closeOnClick={false}
      >
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              ref={ref}
              css={{ "--tooltip-bg": bg }}
              {...contentProps}
            >
              {showArrow && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip />
                </ChakraTooltip.Arrow>
              )}
              {content}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    );
  }
);
