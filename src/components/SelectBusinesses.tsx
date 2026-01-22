import { forwardRef, JSX, useEffect, useMemo, useRef, useState } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useCreateBusiness, useGetBusinessesOptions } from "../hooks/business";

interface ISelectBusinessesProps extends SelectProps {
  onCreate?: (business: { id: number; name: string }) => void;
  value?: number[] | number | null;
  setError?(props: { name: string; message?: string }): void;
  filter?: (opt: { id: number; name: string }[]) => any;
  isFlow?: boolean;
}

const SelectBusinesses = forwardRef<any, ISelectBusinessesProps>(
  (
    { isMulti, value, setError, filter, isFlow, ...props },
    ref,
  ): JSX.Element => {
    const canTriggerCreate = useRef(null);
    const [newBusinessName, setNewBusinessName] = useState("");

    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetBusinessesOptions();

    const { mutateAsync: createBusiness, isPending: isPendingCreate } =
      useCreateBusiness({
        setError: (name, { message }) => {
          setError?.({ name, message });
        },
      });

    useEffect(() => {
      const handleKey = async (e: KeyboardEvent) => {
        if (canTriggerCreate.current && e.key === "Enter") {
          e.preventDefault();
          const cloneName = structuredClone(newBusinessName);
          const { id } = await createBusiness({ name: cloneName });
          setNewBusinessName("");
          props.onCreate?.({ id, name: cloneName });
          return;
        }
      };

      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, [newBusinessName]);

    const resolveOpt = useMemo(() => {
      if (filter) return filter(opt || []);
      return opt || [];
    }, [opt]);

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "os projetos" : "o projeto"}`}
        options={resolveOpt.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))}
        isDisabled={isLoading || isFetching || isPending || isPendingCreate}
        onInputChange={(newValue) => {
          setNewBusinessName(newValue);
        }}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhum projeto {inputValue && `"${inputValue}"`} encontrado.
              </span>
              {!inputValue && (
                <span className="text-sm text-white/80">
                  Digite o nome do projeto que quer adicionar.
                </span>
              )}
              {inputValue && (
                <div
                  ref={canTriggerCreate}
                  className="flex flex-col gap-1 items-center"
                >
                  {isPendingCreate ? (
                    <span className="text-white/60">
                      Criando novo projeto...
                    </span>
                  ) : (
                    <span className="text-xs">
                      <strong className="text-white/80">ENTER</strong> para
                      adicionar rapidamente.
                    </span>
                  )}
                </div>
              )}
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

export default SelectBusinesses;
