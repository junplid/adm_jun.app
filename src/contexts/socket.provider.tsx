import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Manager } from "socket.io-client";
import { AuthContext } from "./auth.context";
import { toaster } from "@components/ui/toaster";
import { queryClient } from "../main";
import { useLocation, useNavigate } from "react-router-dom";
import { LuNotepadText } from "react-icons/lu";
import { SocketContext } from "./socket.context";
import { useDialogModal } from "../hooks/dialog.modal";
import { ModalChatPlayer } from "../pages/inboxes/departments/modals/Player/modalChat";
import { toast } from "sonner";
import { MdOutlineNotificationsActive } from "react-icons/md";
import HTMLReactParser from "html-react-parser/lib/index";

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
  id: number;
}

interface PropsNotifyOrder {
  accountId: number;
  title: string;
  id: number;
  action: "new" | "update";
}

interface INotification {
  type?: string;
  title_txt: string;
  body_txt: string;
  title_html?: string;
  body_html?: string;
  toast_position?: string;
  toast_duration?: number;
  url_redirect?: string;
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
    [manager, account.id, clientMeta],
  );

  const ns = (nsp: string, opts = {}) => manager.socket(nsp, { ...opts });

  const onSetFocused = useCallback(
    (focus: string | null) => {
      socket.emit("set-focused", { focus });
    },
    [socket],
  );

  useEffect(() => {
    socket.on("connect_error", () => setStateSocket("disconnected"));
    socket.on("connect", () => setStateSocket("connected"));
    socket.on("notification", (props: INotification) => {
      const toastId = toast(
        <div
          onClick={() => {
            toast.dismiss(toastId);
            if (props.url_redirect) {
              const redirect = props.url_redirect.replace(
                "$self",
                location.pathname + location.search,
              );
              navigate(redirect);
            }
          }}
          className="p-3.5 bg-zinc-800 rounded-lg border-0 min-w-xs"
        >
          <div className="flex flex-col w-full text-white relative">
            <span className="absolute -top-2 -right-2 text-green-100/70 text-xs font-light">
              <MdOutlineNotificationsActive size={20} />
            </span>
            {HTMLReactParser(props.body_html || props.body_txt)}
          </div>
        </div>,
        {
          position: "top-right",
          classNames: {
            default: "border-0!",
            content: "w-full border-0!",
          },
          unstyled: true,
        },
      );
      // aparecer o toast;

      // testar o redirect, captura e limpeza da url.
    });
    return () => {
      socket.off("connect_error");
      socket.off("connect");
    };
  }, [socket, navigate]);

  const { dialog: DialogModal, close, onOpen } = useDialogModal({});

  useEffect(() => {
    (async () => {
      if (!location.search) return;

      const params = Object.fromEntries(
        new URLSearchParams(location.search).entries(),
      );

      if (params.open_ticket) {
        const ticketId = Number(params.open_ticket);
        onOpen({
          size: "xl",
          content: (
            <ModalChatPlayer
              close={close}
              data={{
                businessId: Number(params.bId),
                id: ticketId,
                name: `${params.name}`,
              }}
            />
          ),
        });
      }
      navigate(location.pathname, { replace: true });
    })();
  }, [location.search]);

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
              },
            );
          }
          if (departmentOpenId === data.departmentId) return;
          // modificação aqui
          // if (data.notifyToast && data.status === "NEW") {
          //   toaster.create({
          //     title: data.departmentName,
          //     ...(data.status === "NEW" && {
          //       description: `Novo ticket em: ${data.departmentName}`,
          //     }),
          //     type: data.status === "NEW" ? "info" : "info",
          //     closable: false,
          //     duration: 1000 * 60 * 100,
          //   });
          // }
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
                  <LuNotepadText className="text-green-400" size={31} />{" "}
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
    return { socket: socket, setdepartmentOpenId, ns, onSetFocused };
  }, [socket]);

  return (
    <SocketContext.Provider value={dataValue}>
      <audio
        className="hidden"
        ref={audioOrderRef}
        src="/audios/notify-fade-in.mp3"
      />
      {children}
      {DialogModal}
    </SocketContext.Provider>
  );
};
