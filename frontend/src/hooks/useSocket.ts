import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type UseSocketReturnType = {
  socket: Socket | null;
  isConnected: boolean;
};
export const useSocket = (serverUrl: string): UseSocketReturnType => {
  //소켓 정상 연결 여부
  const [isConnected, setIsConnected] = useState(false);

  //소켓이 재설정되지 않도록 (하나의 연결을 유지)
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(serverUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [serverUrl]);

  return { socket: socketRef.current, isConnected };
};
