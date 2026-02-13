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
  by: "contact" | "user" | "system";
  forceOpen?: boolean;
  departmentId: number;
  notifyMsc?: boolean;
  userId?: number; // caso seja enviado para um usuário.
  lastInteractionDate: Date;
  count_unread: number;
  lastMessage: string | null;
  connection: { s: boolean; name: string; channel: "baileys" | "instagram" };
}

type TypeStatusMessage = "SENT" | "DELIVERED";

export type MessageContentType = (
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image" | "video";
      fileName: string;
      caption?: string;
    }
  | {
      type: "audio";
      fileName: string;
      ptt?: boolean;
    }
  | {
      type: "file";
      fileNameOriginal?: string;
      fileName: string;
      caption?: string;
    }
) & {
  createAt?: Date;
  id?: number;
  code_uuid?: string;
  status?: TypeStatusMessage;
  error?: string;
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
  connection: {
    s: boolean;
    name: string;
    channel: "baileys" | "instagram";
    id: number;
  };
  messages: {
    content: MessageContentType;
    by: "contact" | "user" | "system";
  }[];
}

interface PropsSocketMessageTicketList {
  ticketId: number;
  by: "contact" | "user" | "system";
  type: MessageContentType["type"];
  status: TypeStatusMessage;
  createAt: Date;
  text?: string;
}

export const PlayerProvider = ({ children }: PropsProviderPlayerContext_I) => {
  const { logout } = useContext(AuthContext);
  const { socket, joinRoom } = useContext(SocketContext);
  const [filter, setFilter] = useState<TypeFilter>("Aguardando");
  const [countNew, setCountNew] = useState(0);
  const [list, setList] = useState<PropsDataList[]>([]);
  const [loadReturn, setLoadReturn] = useState<number | null>(null);
  const [loadResolved, setLoadResolved] = useState<number | null>(null);
  const [loadData, setLoadData] = useState(true);
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
        joinRoom("ticket", { id: currentTicket });
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
    socket.on("return_ticket_list", (data: PropsDataList) => {
      setCountNew((prev) => prev + 1);
      setLoadReturn((s) => (s === data.id ? null : s));
      setCurrentTicket((s) => {
        if (s === data.id) {
          setLoadData(true);
          socket.emit(`leave_ticket`, { id: data.id });
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
              socket.emit(`leave_ticket`, { id: data.id });
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
    });
    socket.on("resolve_ticket_list", (data: PropsDataList) => {
      setLoadResolved((s) => (s === data.id ? null : s));
      setCurrentTicket((s) => {
        if (s === data.id) {
          setLoadData(true);
          socket.emit(`leave_ticket`, { id: data.id });
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
    });
    socket.on("new_ticket_list", (data: PropsDataList) => {
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
    });
    socket.on("open_ticket_list", (data: PropsDataList) => {
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
    });
    socket.on("message_ticket_list", (data: PropsSocketMessageTicketList) => {
      setList((prev) => {
        return prev.map((item) => {
          if (item.id === data.ticketId) {
            item.lastInteractionDate = data.createAt;
            item.lastMessage =
              data.type === "text" ? data.text! : "🎤📷 Arquivo(s) de mídia";
            item.by = data.by;
          }
          return item;
        });
      });
    });

    return () => {
      socket.off("return_ticket_list");
      socket.off("resolve_ticket_list");
      socket.off("new_ticket_list");
      socket.off("open_ticket_list");
      socket.off("message_ticket_list");
    };
  }, []);

  const dataValue = useMemo(() => {
    return {
      filter,
      currentTicket,
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
