import { Socket } from "socket.io-client";

export const useSocketEmit = (socket: Socket | null) => {
  return (eventName: string, data: any) => {
    if (socket) {
      socket.emit(eventName, data);
    }
  };
};
