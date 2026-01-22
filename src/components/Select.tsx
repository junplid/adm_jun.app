import { forwardRef } from "react";
import Select, { Props as SelectProps } from "react-select";

interface SelectInputProps extends SelectProps {
  isFlow?: boolean;
}

const SelectComponent = forwardRef<any, SelectInputProps>(
  ({ isFlow, ...props }, ref) => {
    return (
      <Select
        isClearable
        menuPlacement="auto"
        // menuPortalTarget={document.body}
        styles={{
          indicatorSeparator: (base) => ({ ...base, display: "none" }),
          dropdownIndicator: (base) => ({ ...base, display: "none" }),
          input: (base) => ({ ...base, color: "#dfe9eb" }),
          container: (base, props) => ({
            ...base,
            width: "100%",
            opacity: props.isDisabled ? 0.5 : 1,
          }),
          control: (base, props) => ({
            ...base,
            backgroundColor: "transparent",
            border: `1px solid #27272a`,
            ":hover": {
              border: `1px solid #27272a`,
            },
            cursor: "text",
            boxShadow: props.menuIsOpen ? "0px 0px 0px 1.5px white" : undefined,
            transition: "none",
            padding: "0 2px",
          }),
          clearIndicator: (base) => ({
            ...base,
            color: "#ffffff",
            cursor: "pointer",
            ":hover": {
              color: "#ffffff",
            },
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "#4a4a4a59",
            margin: 2.7,
            ":first-of-type": {
              marginLeft: "0 !important",
            },
          }),
          singleValue: (base) => ({
            ...base,
            color: "#ffffff",
            fontWeight: 500,
          }),
          multiValueRemove: (base) => ({
            ...base,
            cursor: "pointer",
            ":hover": {
              backgroundColor: "#4a4a4a6f",
              color: "#ffffff",
            },
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#ffffff",
            fontWeight: 500,
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "#111111",
            border: `1px solid #27272a`,
            marginTop: 7,
            borderRadius: "3px",
            boxShadow: "0px 6px 10px -3px #090909e4",
            overflow: "hidden",
          }),
          menuList: (base) => ({
            ...base,
            padding: 4,
          }),
          option: (base, props) => ({
            ...base,
            backgroundColor: props.isFocused ? "#1F1E20" : "#111111",
            color: props.isDisabled ? "#5f5f5f" : "#ffffff",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "0.125rem",
            // ":hover": {
            //   backgroundColor: "#252425",
            //   color: "#ffffff",
            // },
          }),
        }}
        ref={ref}
        menuPosition={isFlow ? "fixed" : "absolute"}
        menuPortalTarget={isFlow ? document.body : undefined}
        components={
          isFlow
            ? {
                Option: (props) => {
                  const handleMouseDown = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    props.innerRef?.(e.currentTarget as HTMLDivElement);
                    props.selectOption(props.data);
                  };

                  return (
                    <div
                      style={{
                        backgroundColor: props.isFocused
                          ? "#1f1e20"
                          : "transparent",
                        padding: "6px 8px",
                        cursor: "pointer",
                        fontSize: "15px",
                        borderRadius: "0.125rem",
                      }}
                      onMouseDown={handleMouseDown}
                      {...props.innerProps}
                    >
                      {props.children}
                    </div>
                  );
                },
              }
            : undefined
        }
        {...props}
      />
    );
  },
);

export default SelectComponent;
