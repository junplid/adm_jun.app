import { forwardRef, JSX, useEffect, useRef, useState } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useCreateTag, useGetTagsOptions } from "../hooks/tag";

interface ISelectTagsProps extends SelectProps {
  onCreate?: (business: { id: number; name: string }) => void;
  value?: number[] | number | null;
}

const SelectTags = forwardRef<any, ISelectTagsProps>(
  ({ isMulti, value, ...props }, ref): JSX.Element => {
    const canTriggerCreate = useRef(null);
    const [newTagName, setNewTagName] = useState("");

    const { data: opt, isFetching, isLoading, isPending } = useGetTagsOptions();
    const { mutateAsync: createTag, isPending: isPendingCreate } =
      useCreateTag();

    useEffect(() => {
      const handleKey = async (e: KeyboardEvent) => {
        if (canTriggerCreate.current && e.key === "Enter") {
          e.preventDefault();
          const cloneName = structuredClone(newTagName);
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
        onInputChange={(newValue) => {
          setNewTagName(newValue);
        }}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhuma etiqueta {inputValue && `"${inputValue}"`} encontrada
              </span>
              {!inputValue && (
                <span className="text-sm text-white/80">
                  Digite o nome da etiqueta que quer adicionar
                </span>
              )}
              {inputValue && (
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
                      adicionar rapidamente
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
        {...props}
      />
    );
  }
);

export default SelectTags;
