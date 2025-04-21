import { PinInput as ChakraPinInput, Group } from "@chakra-ui/react";
import * as React from "react";

export interface PinInputProps extends ChakraPinInput.RootProps {
  rootRef?: React.RefObject<HTMLDivElement | null>;
  count?: number;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  attached?: boolean;
  backgroundInput?: string;
  colorInput?: string;
  borderColorInput?: string;
}

export const PinInput = React.forwardRef<HTMLInputElement, PinInputProps>(
  function PinInput(props, ref) {
    const {
      count = 4,
      inputProps,
      rootRef,
      attached,
      backgroundInput,
      colorInput,
      borderColorInput,
      ...rest
    } = props;
    return (
      <ChakraPinInput.Root ref={rootRef} {...rest}>
        <ChakraPinInput.HiddenInput ref={ref} {...inputProps} />
        <ChakraPinInput.Control>
          <Group attached={attached}>
            {Array.from({ length: count }).map((_, index) => (
              <ChakraPinInput.Input
                background={backgroundInput}
                color={colorInput}
                borderColor={borderColorInput}
                key={index}
                index={index}
              />
            ))}
          </Group>
        </ChakraPinInput.Control>
      </ChakraPinInput.Root>
    );
  }
);
