import { Tabs as ChakraTabs } from "@chakra-ui/react";
import { forwardRef } from "react";

interface TabsTriggerProps extends ChakraTabs.TriggerProps {}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger(props, ref) {
    const { children, ...rest } = props;
    return (
      <ChakraTabs.Trigger ref={ref} {...rest}>
        {children}
      </ChakraTabs.Trigger>
    );
  }
);

interface TabsListProps extends ChakraTabs.ListProps {
  indicator?: React.ReactNode;
}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList(props, ref) {
    const { children, indicator, ...rest } = props;
    return (
      <ChakraTabs.List ref={ref} {...rest}>
        {children}
        {indicator && <ChakraTabs.Indicator bg={"bg.subtle"} rounded="l2" />}
      </ChakraTabs.List>
    );
  }
);

export const TabsRoot = ChakraTabs.Root;
export const TabsContent = ChakraTabs.Content;
