import { z } from "zod";
import { passwordSchema, usernameSchema } from "@/schemas/auth";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/server/trpc";

export const authRouter = router({
    authMe: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findFirst({
        where: { token: input.token },
      });

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }),

  login: publicProcedure
    .input(z.object({ username: usernameSchema, password: passwordSchema }))
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;

      const user = await ctx.prisma.user.findFirst({
        where: { username },
      });

      if (!user || user.password !== password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = crypto.randomUUID();

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { token: token },
      });

      const { password: _, ...userWithoutPassword } = user;

      return {
        token,
        user: userWithoutPassword,
      };
    }),

    logout: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { token } = input;

      await ctx.prisma.user.update({
        where: { token },
        data: { token: null },
      });
    }),
});
