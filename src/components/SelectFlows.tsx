import { forwardRef, JSX, useEffect, useRef, useState } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useCreateFlow, useGetFlowsOptions } from "../hooks/flow";

interface ISelectFlowsProps extends SelectProps {
  value?: string[] | string | null;
  isFlow?: boolean;
  isCreatable?: boolean;
  onCreate?: (flow: { id: string; name: string }) => void;
  params?: { businessIds?: number[] };
}

const SelectFlows = forwardRef<any, ISelectFlowsProps>(
  (
    { isMulti, value, isCreatable = true, isFlow, params, ...props },
    ref,
  ): JSX.Element => {
    const canTriggerCreate = useRef(null);
    const [newTagName, setNewTagName] = useState("");
    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetFlowsOptions();
    const { mutateAsync: createFlow, isPending: isPendingCreate } =
      useCreateFlow();

    useEffect(() => {
      if (isCreatable) {
        const handleKey = async (e: KeyboardEvent) => {
          if (canTriggerCreate.current && e.key === "Enter") {
            e.preventDefault();
            const cloneName = structuredClone(newTagName).replace(/\s/g, "_");
            const { id } = await createFlow({
              name: cloneName,
              type: "universal",
              businessIds: params?.businessIds,
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

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "os fluxos" : "o fluxo"}`}
        options={(opt || []).map((item) => ({
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
                Nenhum fluxo {inputValue && `"${inputValue}"`} encontrado.
              </span>
              {isCreatable && !inputValue && (
                <span className="text-sm text-white/80">
                  Digite o nome do fluxo que quer adicionar.
                </span>
              )}
              {isCreatable && inputValue && (
                <div
                  ref={canTriggerCreate}
                  className="flex flex-col gap-1 items-center"
                >
                  {isPendingCreate ? (
                    <span className="text-white/60">Criando novo fluxo...</span>
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

export default SelectFlows;
