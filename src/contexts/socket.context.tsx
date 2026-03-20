import { createContext } from "react";
import { Socket } from "socket.io-client";

interface RoomArgsMap {
  account: undefined;
  orders: undefined;
  ticket: { id: number };
  departments: undefined;
  player_department: { id: number };
  dashboard: undefined;
  connections: undefined;
  appointments: undefined;
}
type RoomPrefix = keyof RoomArgsMap;

interface PropsSocketContext_I {
  socket: Socket;
  setdepartmentOpenId: (id: number | null) => void;
  ns: (namespace: string, opts?: any) => Socket;
  onSetFocused: (focus: string | null) => void;
  joinRoom: <T extends RoomPrefix>(room: T, args: RoomArgsMap[T]) => void;
}

export const SocketContext = createContext({} as PropsSocketContext_I);
