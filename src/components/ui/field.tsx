import { Field as ChakraField } from "@chakra-ui/react";
import * as React from "react";

export interface FieldProps extends Omit<ChakraField.RootProps, "label"> {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  optionalText?: React.ReactNode;
  buttonInLabel?: React.ReactNode;
  buttonInBottom?: React.ReactNode;
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  function Field(props, ref) {
    const {
      label,
      children,
      helperText,
      errorText,
      buttonInLabel,
      buttonInBottom,
      optionalText,
      ...rest
    } = props;
    return (
      <ChakraField.Root ref={ref} {...rest} gap={"3px"}>
        {label && (
          <ChakraField.Label mb={"2px"}>
            {label}
            <ChakraField.RequiredIndicator fallback={optionalText} />
            {buttonInLabel}
          </ChakraField.Label>
        )}
        {children}
        {buttonInBottom && (
          <div className="flex justify-end w-full -mt-0.5">
            {buttonInBottom}
          </div>
        )}
        {helperText && (
          <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
        )}
        {errorText && (
          <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>
        )}
      </ChakraField.Root>
    );
  }
);
