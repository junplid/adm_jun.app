import { SocketContext } from "@contexts/socket.context";
import {
  JSX,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getTicket,
  getTickets,
  pickTicket,
} from "../../../../../services/api/Ticket";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";
import { PlayerContext } from "./context";

const translateFilter: Record<
  TypeFilter,
  "NEW" | "OPEN" | "RESOLVED" | "DELETED" | undefined
> = {
  Aguardando: "NEW",
  Atendendo: "OPEN",
  Resolvidos: "RESOLVED",
  Deletados: "DELETED",
  Todos: undefined,
};

interface PropsProviderPlayerContext_I {
  children: JSX.Element;
  businessId: number;
}

export type TypeFilter =
  | "Deletados"
  | "Todos"
  | "Aguardando"
  | "Atendendo"
  | "Resolvidos";

export interface PropsDataList {
  status: "NEW" | "OPEN" | "RESOLVED" | "DELETED" | "RETURN";
  name: string;
  id: number;
  forceOpen?: boolean;
  departmentId: number;
  notifyMsc?: boolean;
  userId?: number; // caso seja enviado para um usuário.
  lastInteractionDate: Date;
  count_unread: number;
  lastMessage: string | null;
}

export type MessageType =
  | {
      type: "text";
      text: string;
      id: number;
      createAt: Date;
    }
  | {
      type: "image" | "video";
      id: number;
      createAt: Date;
      fileName: string;
      caption?: string;
    }
  | {
      type: "audio";
      createAt: Date;
      fileName: string;
      ptt?: boolean;
    }
  | {
      type: "file";
      fileNameOriginal?: string;
      fileName: string;
      createAt: Date;
      caption?: string;
    };

export interface Ticket {
  id: number;
  inboxDepartmentId: number;
  businessId: number;
  inboxUserId: number | null;
  status: "NEW" | "OPEN" | "RESOLVED" | "DELETED";
  contact: {
    name: string;
    completeNumber: string;

    tags: { id: number; name: string }[];
  };
  messages: {
    content: MessageType;
    by: "contact" | "user" | "system";
  }[];
}

interface PropsSocketMessage {
  ticketId: number;
  by: "contact" | "user" | "system";
  content: MessageType;
  notifyMsc?: boolean;
  departmentId: number;
  userId?: number; // caso seja enviado para um usuário.
  lastInteractionDate: Date;
  read: boolean;
}

export const PlayerProvider = ({
  children,
  businessId,
}: PropsProviderPlayerContext_I) => {
  const { logout, account } = useContext(AuthContext);
  const { socket, ns } = useContext(SocketContext);
  const [filter, setFilter] = useState<TypeFilter>("Aguardando");
  const [countNew, setCountNew] = useState(0);
  const [list, setList] = useState<PropsDataList[]>([]);
  const [loadReturn, setLoadReturn] = useState<number | null>(null);
  const [loadResolved, setLoadResolved] = useState<number | null>(null);
  const [loadData, setLoadData] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<number | null>(null);
  const [dataTicket, setDataTicket] = useState<Ticket | null>(null);

  const pick = useCallback(async (id: number) => {
    try {
      setFilter("Atendendo");
      await pickTicket(id);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) logout();
        if (error.response?.status === 400) {
          const dataError = error.response?.data as ErrorResponse_I;
          if (dataError.toast.length) dataError.toast.forEach(toaster.create);
        }
      }
    }
  }, []);

  const socketNS = useMemo(() => {
    return ns(`/business-${businessId}/inbox`, {
      auth: { accountId: account.id },
      timeout: 3000,
    });
  }, [socket]);

  useEffect(() => {
    if (!currentTicket) {
      setDataTicket(null);
      setLoadData(false);
      return;
    }
    (async () => {
      try {
        setLoadData(true);
        const ticket = await getTicket(currentTicket);
        setList((prev) => {
          return prev.filter((item) => {
            if (item.id === ticket.id) item.count_unread = 0;
            return item;
          });
        });
        setDataTicket(ticket);
        setLoadData(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          setLoadData(false);
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
      }
    })();
  }, [currentTicket]);

  useEffect(() => {
    (async () => {
      try {
        const tickets = await getTickets({ status: translateFilter[filter] });
        setList(tickets);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) logout();
          if (error.response?.status === 400) {
            const dataError = error.response?.data as ErrorResponse_I;
            if (dataError.toast.length) dataError.toast.forEach(toaster.create);
          }
        }
      }
    })();
  }, [filter]);

  useEffect(() => {
    socketNS.on("list", (data: PropsDataList) => {
      if (data.status === "RETURN") {
        setCountNew((prev) => prev + 1);
        setLoadReturn((s) => (s === data.id ? null : s));
        setCurrentTicket((s) => {
          if (s === data.id) {
            setLoadData(true);
            return null;
          }
          return s;
        });
        setDataTicket((t) => {
          if (!t) return t;
          if (t.id === data.id) return null;
          return t;
        });
        setFilter((fil) => {
          if (fil === "Aguardando") {
            setList((prev) => {
              const exists = prev.find((item) => item.id === data.id);
              if (exists) return prev;
              return [data, ...prev];
            });
          }
          if (fil === "Atendendo") {
            setCurrentTicket((s) => {
              if (s === data.id) {
                setLoadData(true);
                return null;
              }
              return s;
            });
            setList((prev) => prev.filter((item) => item.id !== data.id));
          }
          if (fil === "Resolvidos") {
            setList((prev) => prev.filter((item) => item.id !== data.id));
          }
          return fil;
        });
      }
      if (data.status === "RESOLVED") {
        setLoadResolved((s) => (s === data.id ? null : s));
        setCurrentTicket((s) => {
          if (s === data.id) {
            setLoadData(true);
            return null;
          }
          return s;
        });
        setDataTicket((t) => {
          if (!t) return t;
          if (t.id === data.id) return null;
          return t;
        });
        setFilter((fil) => {
          if (fil === "Aguardando") {
            setList((prev) => prev.filter((item) => item.id !== data.id));
          }
          if (fil === "Atendendo") {
            setList((prev) => prev.filter((item) => item.id !== data.id));
          }
          if (fil === "Resolvidos") {
            setList((prev) => {
              const exists = prev.find((item) => item.id === data.id);
              if (exists) return prev;
              return [data, ...prev];
            });
          }
          return fil;
        });
      }
      if (data.status === "NEW") {
        setCountNew((prev) => prev + 1);
        setFilter((fil) => {
          if (fil === "Aguardando") {
            setList((prev) => {
              const exists = prev.find((item) => item.id === data.id);
              if (exists) return prev;
              return [data, ...prev];
            });
          }
          return fil;
        });
      }
      if (data.status === "OPEN") {
        setCountNew((prev) => (prev > 0 ? prev - 1 : 0));
        setCurrentTicket((s) => {
          if (s === data.id) {
            setDataTicket((t) => {
              if (!t) return t;
              t.status = "OPEN";
              return t;
            });
          }
          return s;
        });
        setFilter((fil) => {
          if (fil === "Aguardando") {
            setList((prev) => prev.filter((item) => item.id !== data.id));
          }
          if (fil === "Atendendo") {
            setList((prev) => {
              const exists = prev.find((item) => item.id === data.id);
              if (exists) return prev;
              return [data, ...prev];
            });
          }
          if (filter === "Resolvidos") {
            setList((prev) => prev.filter((item) => item.id !== data.id));
          }
          return fil;
        });
      }
    });

    socketNS.on("message-list", (data: PropsSocketMessage) => {
      setCurrentTicket((s) => {
        if (data.ticketId !== s) {
          if (data.notifyMsc) {
            // enviar notificação para o usuário
          }
        }
        setList((prev) => {
          return prev.map((item) => {
            if (item.id === data.ticketId) {
              item.lastInteractionDate = data.lastInteractionDate;
              item.lastMessage =
                data.content.type === "text"
                  ? data.content.text
                  : "🎤📷 Arquivo de midia";
              item.count_unread += 1;
              item.count_unread = data.read ? 0 : 1;
            }
            return item;
          });
        });
        return s;
      });
    });

    return () => {
      socketNS.off("list");
      socketNS.off("message");
    };
  }, [socketNS]);

  const dataValue = useMemo(() => {
    return {
      filter,
      currentTicket,
      socket: socketNS,
      countNew,
      list,
      loadReturn,
      dataTicket,
      loadData,
      loadResolved,
      setLoadResolved,
      setLoadData,
      setDataTicket,
      setLoadReturn,
      pick,
      setFilter,
      setCountNew,
      setCurrentTicket,
    };
  }, [
    filter,
    socketNS,
    list,
    loadData,
    countNew,
    dataTicket,
    loadReturn,
    currentTicket,
    loadResolved,
  ]);

  return (
    <PlayerContext.Provider value={dataValue}>
      {children}
    </PlayerContext.Provider>
  );
};
