import { forwardRef, JSX } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useGetFlowsOptions } from "../hooks/flow";

interface ISelectFlowsProps extends SelectProps {
  value?: string[] | string | null;
}

const SelectFlows = forwardRef<any, ISelectFlowsProps>(
  ({ isMulti, value, ...props }, ref): JSX.Element => {
    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetFlowsOptions();

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "os fluxos" : "o fluxo"}`}
        options={(opt || []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        isDisabled={isLoading || isFetching || isPending}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhum fluxo {inputValue && `"${inputValue}"`} encontrado
              </span>
            </div>
          );
        }}
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

export default SelectFlows;
