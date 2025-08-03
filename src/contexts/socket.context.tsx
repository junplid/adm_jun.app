import { createContext } from "react";
import { Socket } from "socket.io-client";

interface PropsSocketContext_I {
  socket: Socket;
  setdepartmentOpenId: (id: number | null) => void;
  ns: (namespace: string, opts?: any) => Socket;
}

export const SocketContext = createContext({} as PropsSocketContext_I);
