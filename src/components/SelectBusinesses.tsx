import { forwardRef, JSX, useEffect, useRef } from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { useGetBusinessesOptions } from "../hooks/business";

interface ISelectBusinessesProps extends SelectProps {}

const SelectBusinesses = forwardRef<any, ISelectBusinessesProps>(
  ({ isMulti, ...props }, ref): JSX.Element => {
    const canTriggerCreate = useRef(null);

    const {
      data: opt,
      isFetching,
      isLoading,
      isPending,
    } = useGetBusinessesOptions();

    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        // if (canTriggerCreate.current && e.ctrlKey && e.key === "Enter") {
        //   e.preventDefault();
        //   alert("Criar empresa completa");
        //   return;
        // }
        if (canTriggerCreate.current && e.key === "Enter") {
          e.preventDefault();
          alert("Criar empresa rápida");
          return;
        }
      };

      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }, []);

    return (
      <SelectComponent
        ref={ref}
        isLoading={isLoading || isFetching || isPending}
        placeholder={`Selecione ${isMulti ? "as empresas" : "a empresa"}`}
        options={(opt || []).map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhuma empresa {inputValue && `"${inputValue}"`} encontrada
              </span>
              {!inputValue && (
                <span className="text-sm text-white/80">
                  Digite o nome da empresa que quer adicionar
                </span>
              )}
              {inputValue && (
                <div
                  ref={canTriggerCreate}
                  className="flex flex-col gap-1 items-center"
                >
                  <a className="text-xs">
                    <strong className="text-white/80">ENTER</strong> para
                    adicionar rapidamente
                  </a>
                  {/* <a className="text-xs">
                            <strong className="text-white/80">CTRL</strong> +{" "}
                            <strong className="text-white/80">ENTER</strong>{" "}
                            para adição completa
                          </a> */}
                </div>
              )}
            </div>
          );
        }}
        isMulti={isMulti}
        {...props}
      />
    );
  }
);

export default SelectBusinesses;
