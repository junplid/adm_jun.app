import { forwardRef, JSX } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useGetConnectionsWAOptions } from "../hooks/connectionWA";

interface ISelectConnectionsWAProps extends SelectProps {
  value?: number[] | number | null;
}

const SelectConnectionsWA = forwardRef<any, ISelectConnectionsWAProps>(
  ({ isMulti, value, ...props }, ref): JSX.Element => {
    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetConnectionsWAOptions();

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "as conexões" : "a conexão"}`}
        options={(opt || []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        isDisabled={isLoading || isFetching || isPending}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhuma conexão {inputValue && `"${inputValue}"`} encontrada.
              </span>
            </div>
          );
        }}
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
  },
);

export default SelectConnectionsWA;
