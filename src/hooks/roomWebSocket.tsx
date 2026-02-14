import { SocketContext } from "@contexts/socket.context";
import { useContext, useEffect } from "react";

interface RoomArgsMap {
  account: undefined;
  orders: undefined;
  ticket: { id: number };
  departments: undefined;
  player_department: { id: number };
  dashboard: undefined;
  connections: undefined;
}
type RoomPrefix = keyof RoomArgsMap;

export const useRoomWebSocket = <T extends RoomPrefix>(
  room: T,
  args: RoomArgsMap[T],
) => {
  const { joinRoom, socket } = useContext(SocketContext);

  useEffect(() => {
    joinRoom(room, args);
    return () => {
      socket.emit(`leave_${room}`, args);
    };
  }, []);
};
