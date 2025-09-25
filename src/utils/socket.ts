import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    if (typeof window === "undefined") {
      throw new Error("Socket cannot be initialized on the server");
    }

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000", {
      path: "/api/socket",
    });
  }
  return socket;
};
