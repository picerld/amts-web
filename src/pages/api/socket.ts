import { Server as NetServer } from "http";
import { Server as IOServer } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { SOCKET_EVENTS } from "@/features/quiz/constans/lobbyConstans";
import { LobbyData } from "@/types/lobby";

export const config = { api: { bodyParser: false } };

const chats: Record<string, any[]> = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log("🔌 Initializing Socket.IO server...");

    // const io = new IOServer((res.socket as any).server as NetServer, {
    //   path: "/api/socket",
    //   cors: {
    //     origin: "*",
    //     methods: ["GET", "POST"],
    //   },
    // });

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

      socket.on(SOCKET_EVENTS.GET_LOBBIES, async () => {
        const allLobbies = await prisma.examLobby.findMany({
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
            bank: {
              include: {
                questions: {
                  include: {
                    answers: true,
                  },
                },
              },
            },
          },
        });

        socket.emit(SOCKET_EVENTS.LOBBY_UPDATED, allLobbies);
      });

      socket.on(SOCKET_EVENTS.PARTICIPANT_LOBBIES_UPDATED, async ({ userId }) => {
        const lobbyUsers = await prisma.lobbyUser.findMany({
          where: { userId: userId },
          include: {
            lobby: {
              include: {
                bank: {
                  include: {
                    questions: {
                      include: {
                        answers: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        socket.emit(SOCKET_EVENTS.PARTICIPANT_LOBBIES_UPDATED, lobbyUsers);
      });

      socket.on(SOCKET_EVENTS.GET_LOBBY_USER, async ({ lobbyId, userId }) => {
        const lobbyUser = await prisma.lobbyUser.findFirst({
          where: { lobbyId: lobbyId, userId: userId },
        });

        socket.emit(SOCKET_EVENTS.LOBBY_USER_UPDATED, lobbyUser);
      });

      socket.on(
        SOCKET_EVENTS.CREATE_LOBBY,
        async (
          data,
          callback: (res: {
            success: boolean;
            lobby?: LobbyData;
            message?: string;
          }) => void
        ) => {
          try {
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

            io.emit(SOCKET_EVENTS.LOBBY_CREATED, lobbyData);

            const allLobbies = await prisma.examLobby.findMany({
              include: {
                instructor: true,
                _count: { select: { LobbyUser: true } },
              },
            });
            io.emit(SOCKET_EVENTS.LOBBY_UPDATED, allLobbies);

            if (callback) callback({ success: true, lobby: lobbyData as LobbyData });
          } catch (err: any) {
            console.error(err);
            if (callback) callback({ success: false, message: err.message });
          }
        }
      );

      socket.on(SOCKET_EVENTS.UPDATE_LOBBY_BANK, async ({ lobbyId, bankId }) => {
        try {
          await prisma.examLobby.update({
            where: { id: lobbyId },
            data: { bankId },
            include: {
              instructor: true,
              _count: { select: { LobbyUser: true } },
            },
          });

          io.emit(SOCKET_EVENTS.BANK_UPDATED, { lobbyId, bankId });

          const allLobbies = await prisma.examLobby.findMany({
            include: {
              instructor: true,
              _count: { select: { LobbyUser: true } },
            },
          });

          io.emit(SOCKET_EVENTS.LOBBY_UPDATED, allLobbies);
        } catch (err: any) {
          console.error("Error updating bank:", err);
          socket.emit("update-error", { message: "Failed to update subject" });
        }
      });

      socket.on(SOCKET_EVENTS.START_QUIZ, async ({ lobbyId }) => {
        const updatedLobby = await prisma.examLobby.update({
          where: { id: lobbyId },
          data: { status: "ONGOING", startTime: new Date() },
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });

        io.emit(SOCKET_EVENTS.QUIZ_STARTED, updatedLobby);
      });

      socket.on(SOCKET_EVENTS.END_QUIZ, async ({ lobbyId }) => {
        await prisma.examLobby.update({
          where: { id: lobbyId },
          data: { status: "FINISHED" },
        });

        io.emit(SOCKET_EVENTS.QUIZ_ENDED, { lobbyId });
      });

      socket.on(
        SOCKET_EVENTS.QUIZ_SUBMIT,
        async ({ lobbyId, userId }: { lobbyId: string; userId: string }) => {
          const lobbyUser = await prisma.lobbyUser.findFirst({
            where: { lobbyId, userId },
          });

          if (!lobbyUser) return;

          const updated = await prisma.lobbyUser.update({
            where: { id: lobbyUser.id },
            data: { finished: true },
          });

          io.emit(SOCKET_EVENTS.QUIZ_SUBMITTED, updated);
        }
      );

      socket.on(SOCKET_EVENTS.JOIN_LOBBY, async ({ lobbyId, userId, username }) => {
        try {
          const lobby = await prisma.examLobby.findUnique({
            where: { id: lobbyId },
          });
          if (!lobby) {
            socket.emit(SOCKET_EVENTS.JOIN_ERROR, { message: "Mission does not exist." });
            return;
          }

          if (lobby.status == "ONGOING") {
            socket.emit(SOCKET_EVENTS.JOIN_ERROR, {
              message: "Mission already started.",
            });
            return;
          }

          const existing = await prisma.lobbyUser.findFirst({
            where: { lobbyId, userId },
          });
          if (!existing) {
            await prisma.lobbyUser.create({
              data: { lobbyId, userId },
            });
          }

          socket.join(lobbyId);

          io.to(socket.id).emit(SOCKET_EVENTS.JOIN_SUCCESS, {
            lobbyId,
            lobbyName: lobby.name,
            lobby: lobby,
          });

          socket.to(lobbyId).emit(SOCKET_EVENTS.STUDENT_JOINED, { userId, username });

          const allLobbies = await prisma.examLobby.findMany({
            include: {
              instructor: true,
              _count: { select: { LobbyUser: true } },
            },
          });

          io.emit(SOCKET_EVENTS.LOBBY_UPDATED, allLobbies);
        } catch (err: any) {
          console.error("Join error:", err);
          socket.emit("join-error", { message: "Failed to join the mission." });
        }
      });

      socket.on(
        SOCKET_EVENTS.CHAT_MESSAGE,
        async ({ lobbyId, userId, username, message }) => {
          const msg = {
            userId,
            username,
            message,
            timestamp: new Date().toISOString(),
          };

          if (!chats[lobbyId]) chats[lobbyId] = [];
          chats[lobbyId].push(msg);
          if (chats[lobbyId].length > 10) {
            chats[lobbyId].shift();
          }

          io.to(lobbyId).emit(SOCKET_EVENTS.CHAT_MESSAGE, msg);
        }
      );

      socket.on(SOCKET_EVENTS.GET_CHATS, async (lobbyId) => {
        if (!chats[lobbyId]) chats[lobbyId] = [];

        socket.emit(SOCKET_EVENTS.CHAT_HISTORY, chats[lobbyId]);
      });

      socket.on(SOCKET_EVENTS.GET_QUESTIONS, async ({ lobbyId }) => {
        try {
          const lobby = await prisma.examLobby.findFirst({
            where: { id: lobbyId },
            include: {
              bank: {
                include: {
                  questions: {
                    include: {
                      answers: true,
                    },
                  },
                },
              },
            },
          });
          socket.emit(SOCKET_EVENTS.QUESTIONS, lobby?.bank?.questions);
        } catch (error) {
          console.error("Error fetching questions:", error);
          socket.emit("error", { message: "Failed to fetch questions" });
        }
      });

      socket.on(SOCKET_EVENTS.LEAVE_LOBBY, async ({ lobbyId, userId, username }) => {
        await prisma.lobbyUser.deleteMany({ where: { lobbyId, userId } });

        socket.emit(SOCKET_EVENTS.LEAVE_SUCCESS, { lobbyId });

        socket.to(lobbyId).emit(SOCKET_EVENTS.STUDENT_LEFT, { lobbyId, userId, username });

        socket.leave(lobbyId);

        const allLobbies = await prisma.examLobby.findMany({
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });
        io.emit(SOCKET_EVENTS.LOBBY_UPDATED, allLobbies);
      });

      socket.on(SOCKET_EVENTS.DELETE_LOBBY, async ({ lobbyId, instructorId }) => {
        const dbLobby = await prisma.examLobby.findFirst({
          where: { id: lobbyId, instructorId },
        });

        if (!dbLobby) {
          socket.emit(SOCKET_EVENTS.DELETE_LOBBY_ERROR, {
            message: "Lobby not found or unauthorized",
          });
          return;
        }

        await prisma.lobbyUser.deleteMany({ where: { lobbyId } });

        await prisma.examLobby.delete({ where: { id: lobbyId } });

        io.emit(SOCKET_EVENTS.LOBBY_DELETED, { lobbyId });

        const allLobbies = await prisma.examLobby.findMany({
          include: {
            instructor: true,
            _count: { select: { LobbyUser: true } },
          },
        });

        io.emit(SOCKET_EVENTS.LOBBY_UPDATED, allLobbies);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });
  }

  res.end();
}
