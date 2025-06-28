import { forwardRef, JSX, useEffect, useMemo, useRef, useState } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useCreateVariable, useGetVariablesOptions } from "../hooks/variable";
import { VariableType } from "../services/api/Variable";

interface ISelectTagsProps extends SelectProps {
  onCreate?: (variable: { id: number; name: string }) => void;
  value?: number[] | number | null;
  isFlow?: boolean;
  isCreatable?: boolean;
  params?: {
    name?: string;
    businessIds?: number[];
    type?: VariableType[];
  };
  filter?: (
    opt: {
      id: number;
      name: string;
      business: {
        name: string;
        id: number;
      }[];
      value: string | null;
      type: VariableType;
    }[]
  ) => any;
}

const SelectVariables = forwardRef<any, ISelectTagsProps>(
  (
    { isMulti, value, isCreatable = true, params, ...props },
    ref
  ): JSX.Element => {
    const canTriggerCreate = useRef(null);
    const [newTagName, setNewTagName] = useState("");

    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetVariablesOptions(params);
    const { mutateAsync: createVariable, isPending: isPendingCreate } =
      useCreateVariable();

    useEffect(() => {
      if (isCreatable) {
        const handleKey = async (e: KeyboardEvent) => {
          if (canTriggerCreate.current && e.key === "Enter") {
            e.preventDefault();
            const cloneName = structuredClone(newTagName).replace(/\s/g, "_");
            const { id } = await createVariable({
              name: cloneName,
              type: "dynamics",
            });
            setNewTagName("");
            props.onCreate?.({ id, name: cloneName });
            return;
          }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
      }
    }, [newTagName]);

    const resolveOpt = useMemo(() => {
      if (props.filter) return props.filter(opt || []);
      return opt || [];
    }, [opt]);

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "as variáveis" : "a variável"}`}
        options={resolveOpt.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))}
        isDisabled={isLoading || isFetching || isPending || isPendingCreate}
        onInputChange={
          isCreatable ? (newValue) => setNewTagName(newValue) : undefined
        }
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhuma variável {inputValue && `"${inputValue}"`} encontrada
              </span>
              {isCreatable && !inputValue && (
                <span className="text-sm text-white/80">
                  Digite o nome da variável que quer adicionar
                </span>
              )}
              {isCreatable && inputValue && (
                <div
                  ref={canTriggerCreate}
                  className="flex flex-col gap-1 items-center"
                >
                  {isPendingCreate ? (
                    <span className="text-white/60">
                      Criando nova variável...
                    </span>
                  ) : (
                    <span className="text-xs">
                      <strong className="text-white/80">ENTER</strong> para
                      adicionar rapidamente
                    </span>
                  )}
                </div>
              )}
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

export default SelectVariables;
