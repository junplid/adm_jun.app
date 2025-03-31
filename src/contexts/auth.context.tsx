import {
  createContext,
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { getAccount } from "../services/api/Account";
import { AxiosError } from "axios";
import { useCookies } from "react-cookie";
import { toaster } from "@components/ui/toaster";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { api } from "../services/api";
import { Spinner } from "@chakra-ui/react";

export interface Account {
  id: number;
  email: string;
  name: string;
  emailVerified: boolean;
  isCustomer: boolean;
  createAt: Date;
  number: string;
  Plan: { type: "paid" | "free" } | null;
}

interface IFlowContextProps {
  account: Account;
  logout(): void;
}

export const AuthContext = createContext({} as IFlowContextProps);

interface IProps {
  children: JSX.Element;
}
export function AuthProvider(props: IProps): JSX.Element {
  const [cookies, __, removeCookies] = useCookies(["auth"]);
  const [account, setAccount] = useState<Account | null>(null);
  const [load, setLoad] = useState<boolean>(false);
  const [statusAPI, setStatusAPI] = useState<boolean>(false);

  const navigate = useNavigate();

  const logout = useCallback(() => {
    removeCookies("auth");
    navigate("/login");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = cookies.auth;
        setAccount(await getAccount(token));
        setStatusAPI(true);
        api.defaults.headers.common["Authorization"] = token;
        setLoad(true);
      } catch (error) {
        setLoad(true);
        if (error instanceof AxiosError) {
          if (error.code === "ERR_CONNECTION_REFUSED") {
            setStatusAPI(false);
            return;
          }
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
            if (dataError.input.length) {
              dataError.input.forEach(({ text, path }) =>
                // @ts-expect-error
                setError(path, { message: text })
              );
            }
          }
        }
      }
    })();
  }, []);

  const dataValue = useMemo(
    () => ({
      account,
      logout,
    }),
    [account]
  );

  return (
    <div className="bg-[#f5f5f5] dark:bg-[#181616c5]">
      {/* @ts-expect-error */}
      <AuthContext.Provider value={dataValue}>
        {!load && (
          <div className="grid h-screen place-items-center">
            <Spinner borderWidth="4px" color="teal.500" size="lg" />
          </div>
        )}
        {load && !statusAPI && (
          <div className="grid h-screen place-items-center">
            <div className="max-w-80 flex flex-col gap-y-2">
              <h1 className="text-lg font-semibold">Servidor indisponível</h1>
              <p className="font-extralight text-white/75">
                Nosso servidor está temporariamente indisponível. Estamos
                cientes do problema e trabalhando para resolvê-lo o mais rápido
                possível. Pedimos desculpas pelo inconveniente e agradecemos sua
                paciência!
              </p>
            </div>
          </div>
        )}
        {load && statusAPI && props.children}
      </AuthContext.Provider>
    </div>
  );
}
