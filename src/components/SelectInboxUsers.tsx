import { forwardRef, JSX } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useGetInboxUsersOptions } from "../hooks/inboxUser";

interface ISelectInboxUsersProps extends SelectProps {
  onCreate?: (business: { id: number; name: string }) => void;
  value?: number[] | number | null;
  setError?(props: { name: string; message?: string }): void;
}

const SelectInboxUsers = forwardRef<any, ISelectInboxUsersProps>(
  ({ isMulti, value, setError, ...props }, ref): JSX.Element => {
    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetInboxUsersOptions();

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "os atendentes" : "o atendente"}`}
        options={(opt || []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        isDisabled={isLoading || isFetching || isPending}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhum atendente {inputValue && `"${inputValue}"`} encontrado
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

export default SelectInboxUsers;
