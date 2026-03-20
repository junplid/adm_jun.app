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
import { getOptionsMenuOnlineSubItems } from "../services/api/MenuOnline";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { toaster } from "./ui/toaster";
import clsx from "clsx";

interface ISelectBusinessesProps extends SelectProps {
  value?: string[] | string | null;
  isFlow?: boolean;
  uuid: string;
}

const SelectMenuOnlineSubItems = forwardRef<any, ISelectBusinessesProps>(
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
          const s = await getOptionsMenuOnlineSubItems({ uuid });
          setData(
            s.map((d) => ({
              value: d.uuids.join("_"),
              label: (
                <div
                  className={clsx(
                    "flex gap-x-1",
                  )}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-x-2">
                      <span className="font-light">({d.uuids.length})</span>
                      <span className="text-lg font-medium">{d.name}</span>
                    </div>
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
        placeholder={`Selecione ${isMulti ? "as opções" : "a opção"}`}
        options={opt}
        isDisabled={load}
        noOptionsMessage={({ inputValue }) => {
          return (
            <div className="flex  text-sm flex-col gap-1 pointer-events-auto">
              <span className="text-white/60">
                Nenhuma opção {inputValue && `"${inputValue}"`} encontrada.
              </span>
            </div>
          );
        }}
        isMulti={isMulti}
        {...(value !== null && value !== undefined
          ? typeof value === "string"
            ? {
              value: [
                { label: opt?.find((i) => i.value === value)?.value, value },
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

export default SelectMenuOnlineSubItems;
