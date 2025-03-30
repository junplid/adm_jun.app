import {
  createContext,
  JSX,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Account, getAccount } from "../services/api/Account";
import { AxiosError } from "axios";
import { useCookies } from "react-cookie";
import { toaster } from "@components/ui/toaster";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { api } from "../services/api";
import { Spinner } from "@chakra-ui/react";

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
        api.defaults.headers.common["Authorization"] = token;
        setLoad(true);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            logout();
          }
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) {
              dataError.toast.forEach(({ text, ...rest }) =>
                toaster.create({
                  title: text,
                  type: rest.type,
                })
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
        {load && props.children}
      </AuthContext.Provider>
    </div>
  );
}
