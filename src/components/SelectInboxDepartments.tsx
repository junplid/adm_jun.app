import { forwardRef, JSX } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useGetInboxDepartmentsOptions } from "../hooks/inboxDepartment";

interface ISelectInboxDepartmentsProps extends SelectProps {
  onCreate?: (business: { id: number; name: string }) => void;
  value?: number[] | number | null;
  setError?(props: { name: string; message?: string }): void;
}

const SelectInboxDepartments = forwardRef<any, ISelectInboxDepartmentsProps>(
  ({ isMulti, value, setError, ...props }, ref): JSX.Element => {
    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetInboxDepartmentsOptions();

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "os departamentos" : "o departamento"}`}
        options={(opt || []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        isDisabled={isLoading || isFetching || isPending}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhum departamento {inputValue && `"${inputValue}"`} encontrado
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
  }
);

export default SelectInboxDepartments;
