import { Server as NetServer } from "http";
import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export const config = { api: { bodyParser: false } };

const chats: Record<string, any[]> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log("🔌 Initializing Socket.IO server...");

    const io = new IOServer((res.socket as any).server as NetServer, {
      path: "/api/socket",
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SOCKET_URL
            : "*",
        methods: ["GET", "POST"],
      },
    });

    (res.socket as any).server.io = io;

    io.on("connection", (socket) => {
      console.log("🟢 Client connected:", socket.id);

      socket.on("get-lobbies", async () => {
        const allLobbies = await prisma.examLobby.findMany({
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });
        socket.emit("lobby-updated", allLobbies);
      });

      socket.on("create-lobby", async (data) => {
        const newLobby = await prisma.examLobby.create({
          data: {
            id: data.id,
            name: data.name,
            instructorId: data.instructorId,
            duration: data.duration,
            status: "WAITING",
          },
        });

        const lobbyData = await prisma.examLobby.findUnique({
          where: { id: newLobby.id },
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });

        io.emit("lobby-created", lobbyData);
        const allLobbies = await prisma.examLobby.findMany({
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });
        io.emit("lobby-updated", allLobbies);

        console.log("Lobby created:", lobbyData);
      });

      // 📌 Teacher starts quiz
      socket.on("start-quiz", async ({ lobbyId }) => {
        const updatedLobby = await prisma.examLobby.update({
          where: { id: lobbyId },
          data: { status: "ONGOING", startTime: new Date() },
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });

        io.emit("quiz-started", updatedLobby);
      });

      socket.on("end-quiz", async ({ lobbyId }) => {
        console.log("Ending quiz for lobby", lobbyId);

        const updated = await prisma.examLobby.update({
          where: { id: lobbyId },
          data: { status: "FINISHED" },
        });

        console.log("Updated lobby:", updated);

        io.emit("quiz-ended", { lobbyId });
      });

socket.on("join-lobby", async ({ lobbyId, userId, username }) => {
  try {
    socket.join(lobbyId);

    const lobby = await prisma.examLobby.findUnique({
      where: { id: lobbyId },
    });

    // Masukin user kalau belum ada
    const existing = await prisma.lobbyUser.findFirst({
      where: { lobbyId, userId },
    });
    if (!existing) {
      await prisma.lobbyUser.create({
        data: { lobbyId, userId, joinedAt: new Date() },
      });
    }

    // Konfirmasi join
    socket.emit("join-success", { lobbyId, lobbyName: lobby?.name });

    // Broadcast join ke member lain
    socket.to(lobbyId).emit("student-joined", { lobbyId, userId, username });

    // Kalau lobby lagi jalan (ONGOING), hitung waktu tersisa
    if (lobby?.status === "ONGOING" && lobby.startTime) {
      const elapsed = Math.floor(
        (Date.now() - lobby.startTime.getTime()) / 1000 / 60
      );
      const remaining = lobby.duration - elapsed;

      if (remaining > 0) {
        socket.emit("quiz-started", {
          id: lobby.id,
          name: lobby.name,
          duration: lobby.duration,
          remaining, // ⬅️ penting, buat student baru
        });
      } else {
        socket.emit("quiz-ended", { lobbyId: lobby.id });
      }
    }

    // Update semua lobby
    const allLobbies = await prisma.examLobby.findMany({
      include: {
        instructor: true,
        _count: { select: { LobbyUser: true } },
      },
    });
    io.emit("lobby-updated", allLobbies);
  } catch (err) {
    console.error("Error adding user to lobby:", err);
    socket.emit("join-error", { message: "Could not join lobby" });
  }
});


      // 📩 handle chat message
      socket.on(
        "chat-message",
        async ({ lobbyId, userId, username, message }) => {
          const msg = {
            userId,
            username,
            message,
            timestamp: new Date().toISOString(),
          };

          // ✅ store in memory (limit to 5 for testing, change to 100 in prod)
          if (!chats[lobbyId]) chats[lobbyId] = [];
          chats[lobbyId].push(msg);
          if (chats[lobbyId].length > 10) {
            chats[lobbyId].shift(); // remove oldest
          }

          // (optional) also save to DB if you want persistent history
          // await prisma.chatMessage.create({ data: { lobbyId, userId, username, message } });

          // ✅ broadcast to everyone in the lobby
          io.to(lobbyId).emit("chat-message", msg);
        }
      );

      // send chat history when requested
      socket.on("get-chats", async (lobbyId) => {
        if (!chats[lobbyId]) chats[lobbyId] = [];

        // if you want from DB:
        // const history = await prisma.chatMessage.findMany({
        //   where: { lobbyId },
        //   orderBy: { createdAt: "asc" },
        //   take: 100, // only last 100 messages
        // });

        socket.emit("chat-history", chats[lobbyId]);
      });

      // 📌 Student leaves lobby
      socket.on("leave-lobby", async ({ lobbyId, userId, username }) => {
        await prisma.lobbyUser.deleteMany({ where: { lobbyId, userId } });

        // Notify the leaving client
        socket.emit("leave-success", { lobbyId });

        // Notify other clients in the lobby
        socket.to(lobbyId).emit("student-left", { lobbyId, userId, username });

        socket.leave(lobbyId);

        const allLobbies = await prisma.examLobby.findMany({
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });
        io.emit("lobby-updated", allLobbies);
      });

      // 📌 Teacher deletes lobby
      socket.on("delete-lobby", async ({ lobbyId, instructorId }) => {
        const dbLobby = await prisma.examLobby.findFirst({
          where: { id: lobbyId, instructorId },
        });

        if (!dbLobby) {
          socket.emit("delete-error", {
            message: "Lobby not found or unauthorized",
          });
          return;
        }

        // Remove related users
        await prisma.lobbyUser.deleteMany({ where: { lobbyId } });

        // Delete lobby
        await prisma.examLobby.delete({ where: { id: lobbyId } });

        io.emit("lobby-deleted", { lobbyId });

        const allLobbies = await prisma.examLobby.findMany({
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });

        io.emit("lobby-updated", allLobbies);

        console.log("Lobby deleted:", dbLobby);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });
  }

  res.end();
}
