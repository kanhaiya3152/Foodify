import { useEffect, useState, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { createContext, useContext } from "react";
import { useAppStore } from "../store/useAppStore";
import { realtimeService } from "../main";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  // Granular selector — this component only re-renders when isAuth changes,
  // not when user data, cart, or location changes.
  const isAuth = useAppStore((s) => s.isAuth);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!isAuth) {
      socket?.disconnect();
      return;
    }

    const newSocket = io(realtimeService, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Socket Connected", newSocket.id);
      setSocket(newSocket);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket Disconnected");
      setSocket(null);
    });

    newSocket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuth, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);