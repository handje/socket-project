import { useEffect } from "react";
import { Socket } from "socket.io-client";

export const useSocketEvent = (
  socket: Socket | null,
  eventName: string,
  callback: (data: any) => void
) => {
  useEffect(() => {
    if (socket) {
      socket.on(eventName, callback);
      return () => {
        socket.off(eventName, callback);
      };
    }
  }, [socket, eventName, callback]);
};
