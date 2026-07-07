import { useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { createContext, useContext } from "react";
import { useAppStore } from "../store/useAppStore";
import { realtimeService } from "../main";

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  // Granular selector — only re-renders this component when isAuth changes
  const isAuth = useAppStore((s) => s.isAuth);

  // Use a ref for the socket instance so connect/disconnect events
  // don't trigger unnecessary re-renders of this provider
  const socketRef = useRef<Socket | null>(null);

  // Only used to notify consumers (via context) when the socket changes
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    // Not authenticated — clean up any existing socket
    if (!isAuth) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      Promise.resolve().then(() => setSocketInstance(null));
      return;
    }

    // Already have an active socket from a previous render
    if (socketRef.current?.connected) return;

    const socket = io(realtimeService, {
      auth: {
        token: localStorage.getItem("token"),
      },
      transports: ["websocket"],
      // Reconnect up to 5 times before giving up
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
      setSocketInstance(socket); // notify consumers that socket is ready
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket Disconnected:", reason);
      // Don't call setSocketInstance(null) here — it causes a re-render
      // which can restart the effect chain. Let reconnection handle it.
    });

    socket.on("connect_error", (err) => {
      console.log("Socket Error:", err.message);
    });

    // Cleanup: disconnect when isAuth changes or component unmounts
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuth]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);