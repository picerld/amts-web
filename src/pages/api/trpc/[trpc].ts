import { createNextApiHandler } from '@trpc/server/adapters/next';
import { createContext } from '@/server/trpc';
import { appRouter } from '@/server/api/root';
import { Server } from "socket.io";

let io: Server | null = null;

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized!");
  }
  return io;
};

export const initSocket = (server: any) => {
  if (io) return io;

  io = new Server(server, {
    path: "/api/socket",
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log("🔥 Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  return io;
};

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
