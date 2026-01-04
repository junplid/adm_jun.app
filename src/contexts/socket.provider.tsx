import { JSX, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Manager } from "socket.io-client";
import { AuthContext } from "./auth.context";
import { toaster } from "@components/ui/toaster";
import { queryClient } from "../main";
import { useLocation, useNavigate } from "react-router-dom";
import { LuNotepadText } from "react-icons/lu";
import { SocketContext } from "./socket.context";

interface PropsProviderSocketContext_I {
  children: JSX.Element;
}

type TStateSocket = "loading" | "disconnected" | "connected";
interface PropsInbox {
  accountId: number;
  departmentId: number;
  departmentName: string;
  status: "NEW" | "OPEN" | "RETURN" | "RESOLVED";
  notifyMsc: boolean;
  notifyToast: boolean;
  id: number;
}

interface PropsNotifyOrder {
  accountId: number;
  title: string;
  id: number;
  action: "new" | "update";
}

export const SocketProvider = ({
  children,
}: PropsProviderSocketContext_I): JSX.Element => {
  const [departmentOpenId, setdepartmentOpenId] = useState<number | null>(null);
  const { account, clientMeta } = useContext(AuthContext);
  const [_stateSocket, setStateSocket] = useState<TStateSocket>("loading");
  const path = useLocation();
  const navigate = useNavigate();
  const audioOrderRef = useRef<HTMLAudioElement | null>(null);

  const manager = useMemo(() => {
    return new Manager(import.meta.env.VITE_API.split("/v1")[0], {
      timeout: 3000,
      autoConnect: true,
    });
  }, [account.id]);

  const socket = useMemo(
    () => manager.socket("/", { auth: { accountId: account.id, clientMeta } }),
    [manager, account.id, clientMeta]
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

                  let tickets_new = s.tickets_new;
                  let tickets_open = s.tickets_open;

                  if (data.status === "NEW") tickets_new += 1;
                  if (data.status === "OPEN") {
                    if (s.tickets_new > 0) tickets_new -= 1;
                    tickets_open += 1;
                  }
                  if (data.status === "RETURN") {
                    tickets_new += 1;
                    if (s.tickets_open > 0) tickets_open -= 1;
                  }
                  if (data.status === "RESOLVED") {
                    tickets_open -= 1;
                  }

                  return {
                    ...s,
                    tickets_new,
                    tickets_open,
                  };
                });
              }
            );
          }
          if (departmentOpenId === data.departmentId) return;
          if (data.notifyToast && data.status === "NEW") {
            toaster.create({
              title: data.departmentName,
              ...(data.status === "NEW" && {
                description: `Novo ticket em: ${data.departmentName}`,
              }),
              type: data.status === "NEW" ? "info" : "info",
              closable: false,
              duration: 1000 * 60 * 100,
            });
          }
        }
      });
    }

    return () => {
      socket.off("inbox");
    };
  }, [socket, departmentOpenId]);

  useEffect(() => {
    if (socket) {
      socket.on("notify-order", (data: PropsNotifyOrder) => {
        if (data.accountId === account.id) {
          if (path.pathname !== "/auth/orders") {
            toaster.create({
              title: (
                <div className="flex items-center gap-x-2">
                  <LuNotepadText
                    className="dark:text-green-400 text-green-700"
                    size={31}
                  />{" "}
                  <span text-green-300>{data.title}</span>
                </div>
              ),
              duration: 4000,
              action: {
                label: "Ir para pedidos",
                onClick() {
                  navigate("/auth/orders");
                },
              },
            });
            audioOrderRef.current?.play();
          }
        }
      });
    }
    return () => {
      socket.off("inbox");
    };
  }, [socket, path.pathname]);

  const dataValue = useMemo(() => {
    return { socket: socket, setdepartmentOpenId, ns };
  }, [socket]);

  return (
    <SocketContext.Provider value={dataValue}>
      <audio
        className="hidden"
        ref={audioOrderRef}
        src="/audios/notify-fade-in.mp3"
      />
      {children}
    </SocketContext.Provider>
  );
};
