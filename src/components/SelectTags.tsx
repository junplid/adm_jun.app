import { forwardRef, JSX, useEffect, useRef, useState } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useCreateTag, useGetTagsOptions } from "../hooks/tag";

interface ISelectTagsProps extends SelectProps {
  onCreate?: (business: { id: number; name: string }) => void;
  value?: number[] | number | null;
  isFlow?: boolean;
  isCreatable?: boolean;
  params?: {
    name?: string;
    businessIds?: number[];
    type?: "contactwa" | "audience";
  };
}

const SelectTags = forwardRef<any, ISelectTagsProps>(
  (
    { isMulti, value, isCreatable = true, params, isFlow, ...props },
    ref,
  ): JSX.Element => {
    const canTriggerCreate = useRef(null);
    const [newTagName, setNewTagName] = useState("");

    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetTagsOptions(params);
    const { mutateAsync: createTag, isPending: isPendingCreate } =
      useCreateTag();

    useEffect(() => {
      if (isCreatable) {
        const handleKey = async (e: KeyboardEvent) => {
          if (canTriggerCreate.current && e.key === "Enter") {
            e.preventDefault();
            const cloneName = structuredClone(newTagName).replace(/\s/g, "_");
            const { id } = await createTag({
              name: cloneName,
              type: "contactwa",
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
        placeholder={`Selecione ${isMulti ? "as etiquetas" : "a etiqueta"}`}
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
                Nenhuma etiqueta {inputValue && `"${inputValue}"`} encontrada.
              </span>
              {isCreatable && !inputValue && (
                <span className="text-sm text-white/80">
                  Digite o nome da etiqueta que quer adicionar.
                </span>
              )}
              {isCreatable && inputValue && (
                <div
                  ref={canTriggerCreate}
                  className="flex flex-col gap-1 items-center"
                >
                  {isPendingCreate ? (
                    <span className="text-white/60">
                      Criando nova etiqueta...
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

export default SelectTags;
