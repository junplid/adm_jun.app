import { SocketContext } from "@contexts/socket.context";
import {
  createContext,
  Dispatch,
  JSX,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Socket } from "socket.io-client";
import { getTickets, pickTicket } from "../../../../../services/api/Ticket";
import { AxiosError } from "axios";
import { AuthContext } from "@contexts/auth.context";
import { ErrorResponse_I } from "../../../../../services/api/ErrorResponse";
import { toaster } from "@components/ui/toaster";

type TypeFilter =
  | "Deletados"
  | "Todos"
  | "Aguardando"
  | "Atendendo"
  | "Resolvidos";

interface PropsDataList {
  status: "NEW" | "OPEN" | "RESOLVED" | "DELETED";
  name: string;
  id: number;
  forceOpen?: boolean;
  departmentId: number;
  notifyMsc?: boolean;
  notifyToast?: boolean;
  userId?: number; // caso seja enviado para um usuário.
  lastInteractionDate: Date;
}

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

interface PropsPlayerContext_I {
  filter: TypeFilter;
  setFilter: (value: TypeFilter) => void;
  socket: Socket;
  setCountNew: Dispatch<SetStateAction<number>>;
  countNew: number;
  list: PropsDataList[];
  pick: (id: number) => Promise<void>;
  setCurrentTicket: Dispatch<SetStateAction<number | null>>;
  currentTicket: number | null;
}

export const PlayerContext = createContext({} as PropsPlayerContext_I);

interface PropsProviderPlayerContext_I {
  children: JSX.Element;
  businessId: number;
}

export const PlayerProvider = ({
  children,
  businessId,
}: PropsProviderPlayerContext_I) => {
  const { logout } = useContext(AuthContext);
  const { socket, ns } = useContext(SocketContext);
  const [filter, setFilter] = useState<TypeFilter>("Aguardando");
  const [countNew, setCountNew] = useState(0);
  const [list, setList] = useState<PropsDataList[]>([]);
  const [currentTicket, setCurrentTicket] = useState<number | null>(null);

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
    return ns(`/business-${businessId}/inbox`);
  }, [socket]);

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
      if (
        (data.status === "NEW" && filter === "Aguardando") ||
        (data.status === "OPEN" && filter === "Atendendo")
      ) {
        setList((prev) => {
          const exists = prev.find((item) => item.id === data.id);
          if (exists) return prev;
          setCountNew((prev) => prev + 1);
          return [data, ...prev];
        });
      }
    });
    return () => {
      socketNS.off("list");
      socketNS.disconnect();
    };
  }, [socketNS]);

  const dataValue = useMemo(() => {
    return {
      filter,
      currentTicket,
      socket: socketNS,
      countNew,
      list,
      pick,
      setFilter,
      setCountNew,
      setCurrentTicket,
    };
  }, [filter, socketNS, list, countNew, currentTicket]);

  return (
    <PlayerContext.Provider value={dataValue}>
      {children}
    </PlayerContext.Provider>
  );
};
