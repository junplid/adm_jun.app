import { forwardRef } from "react";
import Select, { MenuPlacement, Props as SelectProps } from "react-select";
import { useColorModeValue } from "./ui/color-mode";

interface SelectInputProps extends SelectProps {
  isFlow?: boolean;
  menuPlacement?: MenuPlacement;
  singleValueColor?: string;
}

const SelectComponent = forwardRef<any, SelectInputProps>(
  ({ isFlow, menuPlacement, singleValueColor, ...props }, ref) => {
    const bgMultiValue = useColorModeValue("#c6c6c658", "#4a4a4a59");
    const colorTextActive = useColorModeValue("#1d1c1c", "#ededed");
    const colorTextOff = useColorModeValue("#cdcdcd", "#5a5a5a");

    const bgMenu = useColorModeValue("#ffffff", "#111111");

    const bgOptionActive = useColorModeValue("#e9e9e9", "#202020");

    const shadowMenu = useColorModeValue("#7e7e7e64", "#090909e4");
    const colorMenuBorder = useColorModeValue("#f0f0f0", "#27272a");

    return (
      <Select
        isClearable
        menuPlacement={menuPlacement || "auto"}
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
            color: colorTextActive,
            cursor: "pointer",
            ":hover": {
              color: colorTextActive,
            },
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: bgMultiValue,
            margin: 2.7,
            ":first-of-type": {
              marginLeft: "0 !important",
            },
          }),
          singleValue: (base) => ({
            ...base,
            color: singleValueColor || colorTextActive,
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
            color: colorTextActive,
            fontWeight: 500,
          }),
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: bgMenu,
            border: `1px solid ${colorMenuBorder}`,
            marginTop: 7,
            borderRadius: "3px",
            boxShadow: `0px 6px 10px -3px ${shadowMenu}`,
            overflow: "hidden",
          }),
          menuList: (base) => ({
            ...base,
            padding: 4,
          }),
          option: (base, props) => ({
            ...base,
            backgroundColor: props.isFocused ? bgOptionActive : "transparent",
            color: props.isDisabled ? colorTextOff : colorTextActive,
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
