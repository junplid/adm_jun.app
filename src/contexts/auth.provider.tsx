import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccount } from "../services/api/Account";
import { AxiosError } from "axios";
import { toaster } from "@components/ui/toaster";
import { ErrorResponse_I } from "../services/api/ErrorResponse";
import { Spinner } from "@chakra-ui/react";
import { v4 } from "uuid";
import { Account, IClienteMeta, AuthContext } from "./auth.context";

// const isDesktopDevice = () =>
//   typeof navigator === "undefined"
//     ? true
//     : !/Mobi|Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|Opera Mini/i.test(
//         navigator.userAgent
//       );

function getClientMeta(): IClienteMeta {
  const ua = navigator.userAgent.toLowerCase();

  const isMobile = /android|iphone|ipad|ipod/.test(ua);

  const platform = /android/.test(ua)
    ? "android"
    : /iphone|ipad|ipod/.test(ua)
      ? "ios"
      : "desktop";

  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true;

  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;

  return {
    platform,
    isMobile,
    isPWA,
    isTouch,
    isSmallScreen,
    isMobileLike: isTouch || isSmallScreen,
  };
}

interface IProps {
  children: JSX.Element;
}
export function AuthProvider(props: IProps): JSX.Element {
  const [account, setAccount] = useState<Account | null>(null);
  const [load, setLoad] = useState<boolean>(false);
  const [statusAPI, setStatusAPI] = useState<boolean>(false);
  const [clientMeta, setClientMeta] = useState<IClienteMeta>(
    {} as IClienteMeta,
  );

  const navigate = useNavigate();

  const logout = useCallback(async () => {
    navigate("/login", { replace: true });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setClientMeta(getClientMeta());

        const acc = await getAccount();
        setAccount({ ...acc, uuid: v4() });
        setStatusAPI(true);
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
                setError(path, { message: text }),
              );
            }
          }
        }
      }
    })();
    const handleResize = () => setClientMeta(getClientMeta());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dataValue = useMemo(
    () => ({
      account,
      clientMeta,
      logout,
      setAccount,
    }),
    [account, clientMeta],
  );

  return (
    <div className="bg-[#181616c5] h-svh">
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
        {/* {load && statusAPI && !isDesktop && (
          <div className="grid h-screen place-items-center">
            <div className="max-w-80 flex flex-col gap-y-2 text-center">
              <h1 className="text-lg font-semibold">
                Versão mobile em breve 🚧
              </h1>
              <p className="font-extralight text-white/75">
                Este aplicativo foi otimizado para uso em computadores. Acesse
                pelo desktop para a melhor experiência. 😉
              </p>
            </div>
          </div>
        )} */}
        {/* {load && statusAPI && isDesktop && props.children} */}
        {load && statusAPI && props.children}
      </AuthContext.Provider>
    </div>
  );
}
