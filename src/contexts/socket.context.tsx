import {
  createContext,
  JSX,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Socket, Manager } from "socket.io-client";
import { AuthContext } from "./auth.context";
import { toaster } from "@components/ui/toaster";
import { queryClient } from "../main";

type TStateSocket = "loading" | "disconnected" | "connected";

interface PropsSocketContext_I {
  socket: Socket;
  setdepartmentOpenId: (id: number | null) => void;
  ns: (namespace: string, opts?: any) => Socket;
}

export const SocketContext = createContext({} as PropsSocketContext_I);

interface PropsProviderSocketContext_I {
  children: JSX.Element;
}

interface PropsInbox {
  accountId: number;
  departmentId: number;
  departmentName: string;
  status: "NEW" | "OPEN";
  notifyMsc: boolean;
  notifyToast: boolean;
  id: number;
}

export const SocketProvider = ({
  children,
}: PropsProviderSocketContext_I): JSX.Element => {
  const [departmentOpenId, setdepartmentOpenId] = useState<number | null>(null);
  const { account } = useContext(AuthContext);
  const [_stateSocket, setStateSocket] = useState<TStateSocket>("loading");

  const manager = useMemo(() => {
    return new Manager(import.meta.env.VITE_API.split("/v1")[0], {
      timeout: 3000,
      autoConnect: true,
    });
  }, [account.id]);

  const socket = useMemo(
    () => manager.socket("/", { auth: { accountId: account.id } }),
    [manager, account.id]
  );

  const ns = (nsp: string, opts = {}) => manager.socket(nsp, { ...opts });

  useEffect(() => {
    socket.on("connect_error", () => setStateSocket("disconnected"));
    socket.on("connect", () => setStateSocket("connected"));
    return () => {
      socket.off("connect_error");
      socket.off("connect");
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("inbox", (data: PropsInbox) => {
        if (data.accountId === account.id) {
          if (queryClient.getQueryData<any>(["inbox-departments", null])) {
            queryClient.setQueryData(
              ["inbox-departments", null],
              (old: any) => {
                if (!old) return old;
                return old.map((s: any) => {
                  if (s.id !== data.departmentId) return s;
                  return {
                    ...s,
                    tickets_new:
                      data.status === "NEW" ? s.tickets_new + 1 : s.tickets_new,
                    tickets_open:
                      data.status === "OPEN"
                        ? s.tickets_open + 1
                        : s.tickets_open,
                  };
                });
              }
            );
          }
          if (departmentOpenId === data.departmentId) return;
          if (data.notifyToast) {
            toaster.create({
              title: data.departmentName,
              ...(data.status === "NEW" && {
                description: `Novo ticket em: ${data.departmentName}`,
              }),
              type: data.status === "NEW" ? "success" : "info",
              duration: 4000,
            });
          }
        }
      });
    }
    return () => {
      socket.off("inbox");
    };
  }, [socket, departmentOpenId]);

  const dataValue = useMemo(() => {
    return { socket: socket, setdepartmentOpenId, ns };
  }, [socket]);

  return (
    <SocketContext.Provider value={dataValue}>
      {children}
    </SocketContext.Provider>
  );
};
