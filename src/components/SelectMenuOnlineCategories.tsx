import {
  forwardRef,
  JSX,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import SelectComponent from "./Select";
import { Props as SelectProps } from "react-select";
import { getOptionsMenuOnlineCategories } from "../services/api/MenuOnline";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { toaster } from "./ui/toaster";
import { api } from "../services/api";
import clsx from "clsx";

interface ISelectBusinessesProps extends SelectProps {
  value?: string[] | string | null;
  isFlow?: boolean;
  uuid: string;
}

const SelectMenuOnlineCategories = forwardRef<any, ISelectBusinessesProps>(
  ({ isMulti, value, isFlow, uuid, ...props }, ref): JSX.Element => {
    const { logout } = useContext(AuthContext);

    const [load, setLoad] = useState(true);
    const [opt, setData] = useState<
      {
        value: string;
        label: ReactNode;
      }[]
    >([]);

    useEffect(() => {
      (async () => {
        try {
          const s = await getOptionsMenuOnlineCategories({ uuid });
          setData(
            s.map((d) => ({
              value: d.uuid,
              label: (
                <div
                  className={clsx(
                    "flex gap-x-1",
                    d.days_in_the_week_label ? "items-start" : "items-center",
                  )}
                >
                  {d.image45x45png && (
                    <img
                      src={api.getUri() + "/public/images/" + d.image45x45png}
                      className="rounded-sm"
                      width={"35px"}
                      height={"35px"}
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{d.name}</span>
                    <span className="text-xs font-light text-neutral-300">
                      {d.days_in_the_week_label}
                    </span>
                  </div>
                </div>
              ),
            })),
          );
          setLoad(false);
        } catch (error) {
          setLoad(false);
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) logout();
            if (error.response?.status === 400) {
              const dataError = error.response?.data as ErrorResponse_I;
              if (dataError.toast.length)
                dataError.toast.forEach(toaster.create);
            }
          }
        }
      })();
    }, []);

    return (
      <SelectComponent
        ref={ref}
        isLoading={load}
        placeholder={`Selecione ${isMulti ? "as categorias" : "a categoria"}`}
        options={opt}
        isDisabled={load}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhuma categoria {inputValue && `"${inputValue}"`} encontrada.
              </span>
            </div>
          );
        }}
        isMulti={isMulti}
        {...(value !== null && value !== undefined
          ? typeof value === "string"
            ? {
                value: [
                  { label: opt?.find((i) => i.value === value)?.label, value },
                ],
              }
            : {
                value: value.map((item) => ({
                  label: opt?.find((i) => i.value === item)?.label,
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

export default SelectMenuOnlineCategories;
