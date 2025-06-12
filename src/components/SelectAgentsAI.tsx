import { forwardRef, JSX, useMemo } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useGetAgentsAIWAOptions } from "../hooks/agentAI";

interface ISelectAgentsAIProps extends SelectProps {
  onCreate?: (variable: { id: number; name: string }) => void;
  value?: number[] | number | null;
  isFlow?: boolean;
  filter?: (
    opt: {
      id: number;
      name: string;
    }[]
  ) => any;
}

const SelectAgentsAI = forwardRef<any, ISelectAgentsAIProps>(
  ({ isMulti, value, ...props }, ref): JSX.Element => {
    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetAgentsAIWAOptions({});

    const resolveOpt = useMemo(() => {
      if (props.filter) return props.filter(opt || []);
      return opt || [];
    }, [opt]);

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "os agentes IA" : "o agente IA"}`}
        options={resolveOpt.map((item: any) => ({
          label: item.name,
          value: item.id,
          existNodes: item.exitNodes || [],
        }))}
        isDisabled={isLoading || isFetching || isPending}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhum agente {inputValue && `"${inputValue}"`} encontrado
              </span>
            </div>
          );
        }}
        menuPosition={props.isFlow ? "fixed" : "absolute"}
        menuPortalTarget={props.isFlow ? document.body : undefined}
        components={
          props.isFlow
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
          ? typeof value === "number"
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

export default SelectAgentsAI;
