import { publicProcedure, router } from "@/server/trpc";
import { z } from "zod";

export const lobbyRouter = router({
  create: publicProcedure
    .input(z.object({ instructorId: z.string(), name: z.string(), duration: z.number(), bankId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const lobby = await ctx.prisma.examLobby.create({
        data: {
          name: input.name,
          instructorId: input.instructorId,
          duration: input.duration,
        },
      });
      
      return lobby;
    }),

  list: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.examLobby.findMany({
      where: { status: "WAITING" },
    });
  }),

  join: publicProcedure
    .input(z.object({ userId: z.string(), lobbyId: z.string(), username: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.lobbyUser.create({
        data: {
          lobbyId: input.lobbyId,
          userId: input.userId,
        },
      });
    }),

  pickSubject: publicProcedure
    .input(z.object({ lobbyId: z.string(), bankId: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.examLobby.update({
        where: { id: input.lobbyId },
        data: { bankId: input.bankId },
      });
    }),

  start: publicProcedure
    .input(z.object({ lobbyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const startTime = new Date();
      return ctx.prisma.examLobby.update({
        where: { id: input.lobbyId },
        data: { status: "ONGOING", startTime },
        include: { bank: { include: { questions: { include: { answers: true } } } } },
      });
    }),

  end: publicProcedure
    .input(z.object({ lobbyId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.examLobby.update({
        where: { id: input.lobbyId },
        data: { status: "FINISHED" },
      });
    }),

  delete: publicProcedure
    .input(z.object({ lobbyId: z.string(), instructorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete lobby if instructor matches
      const lobby = await ctx.prisma.examLobby.findFirst({
        where: { id: input.lobbyId, instructorId: input.instructorId },
      });

      if (!lobby) throw new Error("Lobby not found");

      // Remove associated LobbyUser records first (optional)
      await ctx.prisma.lobbyUser.deleteMany({ where: { lobbyId: input.lobbyId } });

      // Delete the lobby
      await ctx.prisma.examLobby.delete({ where: { id: input.lobbyId } });

      return { success: true };
    }),
});
