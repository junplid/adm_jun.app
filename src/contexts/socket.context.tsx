import { createContext, JSX, useContext, useMemo, useState } from "react";
import { Socket, io } from "socket.io-client";
import { AuthContext } from "./auth.context";

type TStateSocket = "loading" | "disconnected" | "connected";

interface PropsSocketContext_I {
  socket: Socket;
}

export const SocketContext = createContext({} as PropsSocketContext_I);

interface PropsProviderSocketContext_I {
  children: JSX.Element;
}

export const SocketProvider = ({
  children,
}: PropsProviderSocketContext_I): JSX.Element => {
  const { account } = useContext(AuthContext);
  const [_stateSocket, setStateSocket] = useState<TStateSocket>("loading");

  const socket = useMemo(() => {
    const sio = io(import.meta.env.VITE_API.split("/api")[0], {
      timeout: 3000,
      auth: { accountId: account.id },
    });
    sio.on("connect_error", () => {
      setStateSocket("disconnected");
    });
    sio.on("connect", () => {
      setStateSocket("connected");
    });
    return sio;
  }, [account.id]);

  const dataValue = useMemo(() => {
    return { socket: socket };
  }, [socket]);

  return (
    <SocketContext.Provider value={dataValue}>
      {children}
    </SocketContext.Provider>
  );
};
