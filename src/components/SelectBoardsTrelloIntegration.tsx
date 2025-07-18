import { forwardRef, JSX } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useGetBoardsTrelloIntegrationOptions } from "../hooks/trelloIntegration";

interface ISelectBoardsTrelloIntegrationProps extends SelectProps {
  onCreate?: (board: { id: string; name: string }) => void;
  value?: string[] | string | null;
  isFlow?: boolean;
  trelloIntegrationId: number;
}

const SelectBoardsTrelloIntegration = forwardRef<
  any,
  ISelectBoardsTrelloIntegrationProps
>(
  (
    { isMulti, value, isFlow, trelloIntegrationId, ...props },
    ref
  ): JSX.Element => {
    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetBoardsTrelloIntegrationOptions(trelloIntegrationId);

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "os quadros" : "o quadro"}`}
        options={(opt || []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        isDisabled={isLoading || isFetching || isPending}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhuma quadro {inputValue && `"${inputValue}"`} encontrado
              </span>
            </div>
          );
        }}
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
        isMulti={isMulti}
        {...(value !== null && value !== undefined
          ? typeof value === "string"
            ? {
                value: [
                  { label: opt?.find((i) => i.id === value)?.name, value },
                ],
              }
            : {
                value: value.map((item) => ({
                  label: opt?.find((i) => i.id === item)?.name,
                  value: item,
                })),
              }
          : { value: null })}
        {...props}
      />
    );
  }
);

export default SelectBoardsTrelloIntegration;
